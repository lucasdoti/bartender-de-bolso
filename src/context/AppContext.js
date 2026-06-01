import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [favorites,   setFavorites]   = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);

  // Carrega dados do usuário ao logar
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setIngredients([]);
      setHistory([]);
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [favs, bar, hist] = await Promise.all([
        supabase.from('favorites').select('drink_id').eq('user_id', user.id),
        supabase.from('my_bar').select('ingredient_id').eq('user_id', user.id),
        supabase.from('history').select('drink_id, made_at').eq('user_id', user.id).order('made_at', { ascending: false }),
      ]);
      if (favs.data) setFavorites(favs.data.map(f => f.drink_id));
      if (bar.data)  setIngredients(bar.data.map(b => b.ingredient_id));
      if (hist.data) setHistory(hist.data.map(h => ({ id: h.drink_id, date: h.made_at })));
    } catch (e) {
      console.log('Erro ao carregar dados:', e);
    }
    setLoading(false);
  };

  // ── FAVORITOS ──
  const toggleFavorite = async (drinkId) => {
    if (!user) return;
    const isFav = favorites.includes(drinkId);
    // Atualiza local primeiro (resposta instantânea)
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

  return (
    <AppContext.Provider value={{
      favorites,    toggleFavorite,
      ingredients,  toggleIngredient,
      history,      addToHistory,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
