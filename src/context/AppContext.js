import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

const ADMIN_EMAIL = 'lucas_doti@hotmail.com';

function normalizeExtraDrink(d) {
  return {
    ...d,
    funFact:     d.fun_fact     ?? '',
    stirSeconds: d.stir_seconds ?? 0,
    tags:        d.tags         ?? [],
    needs:       d.needs        ?? [],
    ingredients: d.ingredients  ?? [],
    steps:       d.steps        ?? [],
  };
}

async function loadStreak(userId) {
  const today = new Date().toDateString();
  const [lastRaw, curRaw, lonRaw] = await Promise.all([
    AsyncStorage.getItem(`streak_last_${userId}`),
    AsyncStorage.getItem(`streak_cur_${userId}`),
    AsyncStorage.getItem(`streak_lon_${userId}`),
  ]);
  const cur = parseInt(curRaw || '0');
  const lon = parseInt(lonRaw || '0');

  if (lastRaw === today) return { current: cur, longest: lon };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const newCur = lastRaw === yesterday.toDateString() ? cur + 1 : 1;
  const newLon = Math.max(newCur, lon);

  await Promise.all([
    AsyncStorage.setItem(`streak_last_${userId}`, today),
    AsyncStorage.setItem(`streak_cur_${userId}`,  String(newCur)),
    AsyncStorage.setItem(`streak_lon_${userId}`,  String(newLon)),
  ]);
  return { current: newCur, longest: newLon };
}

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [favorites,   setFavorites]   = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [history,     setHistory]     = useState([]);
  const [ratings,     setRatings]     = useState({});
  const [extraDrinks, setExtraDrinks] = useState([]);
  const [streak,      setStreak]      = useState({ current: 0, longest: 0 });
  const [loading,     setLoading]     = useState(true);
  const [isPremium,   setIsPremium]   = useState(false);

  useEffect(() => {
    if (!user) {
      setFavorites([]); setIngredients([]); setHistory([]);
      setRatings({}); setExtraDrinks([]); setStreak({ current: 0, longest: 0 });
      setIsPremium(false);
      return;
    }
    if (user.email === ADMIN_EMAIL) {
      setIsPremium(true);
    } else {
      supabase.from('profiles').select('is_premium').eq('id', user.id).maybeSingle()
        .then(({ data }) => setIsPremium(data?.is_premium ?? false));
    }
    loadData();
    AsyncStorage.getItem(`drink_ratings_${user.id}`).then(val => {
      setRatings(val ? JSON.parse(val) : {});
    });
    loadStreak(user.id).then(setStreak);
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [favs, bar, hist, extra] = await Promise.allSettled([
        supabase.from('favorites').select('drink_id').eq('user_id', user.id),
        supabase.from('my_bar').select('ingredient_id').eq('user_id', user.id),
        supabase.from('history').select('drink_id, made_at').eq('user_id', user.id).order('made_at', { ascending: false }),
        supabase.from('drinks_extra').select('*').eq('published', true),
      ]);
      if (favs.status  === 'fulfilled' && favs.value.data)  setFavorites(favs.value.data.map(f => f.drink_id));
      if (bar.status   === 'fulfilled' && bar.value.data)   setIngredients(bar.value.data.map(b => b.ingredient_id));
      if (hist.status  === 'fulfilled' && hist.value.data)  setHistory(hist.value.data.map(h => ({ id: h.drink_id, date: h.made_at })));
      if (extra.status === 'fulfilled' && extra.value.data) setExtraDrinks(extra.value.data.map(normalizeExtraDrink));
    } catch (e) {
      console.log('Erro ao carregar dados:', e);
    }
    setLoading(false);
  };

  // ── FAVORITOS ──
  const toggleFavorite = async (drinkId) => {
    if (!user) return;
    const isFav = favorites.includes(drinkId);
    setFavorites(prev => isFav ? prev.filter(x => x !== drinkId) : [...prev, drinkId]);
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('drink_id', drinkId);
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, drink_id: drinkId });
    }
  };

  // ── INGREDIENTES (MEU BAR) ──
  const toggleIngredient = async (ingredientId) => {
    if (!user) return;
    const has = ingredients.includes(ingredientId);
    setIngredients(prev => has ? prev.filter(x => x !== ingredientId) : [...prev, ingredientId]);
    if (has) {
      await supabase.from('my_bar').delete().eq('user_id', user.id).eq('ingredient_id', ingredientId);
    } else {
      await supabase.from('my_bar').insert({ user_id: user.id, ingredient_id: ingredientId });
    }
  };

  // ── HISTÓRICO ──
  const addToHistory = async (drinkId) => {
    if (!user) return;
    const entry = { id: drinkId, date: new Date().toISOString() };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    await supabase.from('history').insert({ user_id: user.id, drink_id: drinkId });
  };

  // ── AVALIAÇÕES ──
  const rateDrink = async (drinkId, stars) => {
    if (!user) return;
    const updated = { ...ratings, [drinkId]: stars };
    setRatings(updated);
    await AsyncStorage.setItem(`drink_ratings_${user.id}`, JSON.stringify(updated));
  };

  // ── REFRESH DRINKS EXTRAS ──
  const refreshExtraDrinks = async () => {
    const { data } = await supabase.from('drinks_extra').select('*').eq('published', true);
    if (data) setExtraDrinks(data.map(normalizeExtraDrink));
  };

  return (
    <AppContext.Provider value={{
      favorites,    toggleFavorite,
      ingredients,  toggleIngredient,
      history,      addToHistory,
      ratings,      rateDrink,
      extraDrinks,  refreshExtraDrinks,
      streak,
      loading,
      isPremium,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
