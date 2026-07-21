import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import BottomNav from '../components/BottomNav';
import { DrinkCardList } from '../components/DrinkCard';
import { useDrinks, ibaOrder } from '../hooks/useDrinks';
import { getDrinkOfDay } from '../lib/drinkOfDay';

const moods = [
  { id: 'calor',  label: 'Refrescante',  emoji: '☀️' },
  { id: 'frio',   label: 'Aconchegante', emoji: '🍂' },
  { id: 'date',   label: 'Pra Date',     emoji: '🥂' },
  { id: 'solo',   label: 'Só eu',        emoji: '🌙' },
  { id: 'festas', label: 'Festa',        emoji: '🪩' },
];

const INGREDIENT_ALIASES = { limao_taiti: 'limao', limao_siciliano: 'limao' };
function norm(id) { return INGREDIENT_ALIASES[id] || id; }

export default function HomeScreen({ navigation }) {
  const { favorites, toggleFavorite, ingredients, ratings, extraDrinks, isPremium } = useApp();
  const { user } = useAuth();
  const drinks = useDrinks();
  const drinkOfDay = getDrinkOfDay(extraDrinks);
  const [activeMood, setActiveMood]     = useState(null);
  const [search, setSearch]             = useState('');
  const [surprisePick, setSurprisePick] = useState(null);

  const displayName = user?.user_metadata?.name || 'Bartender';
  const initials = displayName.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'B';
  const firstName = displayName.split(' ')[0];

  const surpriseMe = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    if (!isPremium) { navigation.navigate('Paywall'); return; }
    const normalized = ingredients.map(norm);
    if (normalized.length === 0) { navigation.navigate('MeuBar'); return; }
    const scored = drinks
      .filter(d => (d.needs || []).length > 0)
      .map(d => {
        const needs = d.needs || [];
        const matched = needs.filter(n => normalized.includes(n)).length;
        return { drink: d, matched, ratio: matched / needs.length };
      })
      .filter(s => s.matched > 0)
      .sort((a, b) => b.ratio - a.ratio || b.matched - a.matched);
    if (scored.length === 0) { navigation.navigate('MeuBar'); return; }
    const candidates = scored.slice(0, 5);
    const { drink: pick, ratio } = candidates[Math.floor(Math.random() * candidates.length)];
    if (ratio === 1) {
      setSurprisePick(null);
      navigation.navigate('DrinkDetail', { drinkId: pick.id });
    } else {
      const missing = (pick.needs || [])
        .filter(n => !normalized.includes(n))
        .map(n => { const ing = pick.ingredients?.find(i => i.id === n); return ing ? ing.name : n; });
      setSurprisePick({ drink: pick, missing });
    }
  };

  const filtered = drinks
    .filter(d => {
      const matchMood   = activeMood ? d.tags.includes(activeMood) : true;
      const q = search.toLowerCase();
      const matchSearch = q === '' ? true :
        d.name.toLowerCase().includes(q) ||
        d.base.toLowerCase().includes(q) ||
        d.ingredients.some(ing => ing.name.toLowerCase().includes(q));
      return matchMood && matchSearch;
    })
    .sort((a, b) => {
      const ai = ibaOrder.indexOf(a.id);
      const bi = ibaOrder.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const quickActions = [
    { emoji: '✨', label: 'Surpresa',    onPress: surpriseMe },
    { emoji: '🥃', label: 'Meu Bar',     onPress: () => isPremium ? navigation.navigate('Tabs', { screen: 'MeuBar' }) : navigation.navigate('Paywall') },
    { emoji: '🤖', label: 'Bartender IA',onPress: () => isPremium ? navigation.navigate('BartenderIA') : navigation.navigate('Paywall') },
    { emoji: '🎉', label: 'Modo Festa',  onPress: () => navigation.navigate('Festa') },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting()}, {firstName} ✦</Text>
            <Text style={styles.title}>
              O que vamos <Text style={styles.titleAccent}>preparar?</Text>
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Tabs', { screen: 'Perfil' })}
            activeOpacity={0.8}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Busque um drink ou ingrediente..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear}>
              <Text style={styles.searchClearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* DRINK DO DIA — hero card */}
        {drinkOfDay && (
          <TouchableOpacity
            onPress={() => navigation.navigate('DrinkDetail', { drinkId: drinkOfDay.id })}
            activeOpacity={0.88}
            style={[styles.drinkHero, { backgroundColor: drinkOfDay.color }]}
          >
            <View style={styles.drinkHeroContent}>
              <Text style={[styles.drinkHeroLabel, { color: drinkOfDay.accent }]}>☀️ DRINK DO DIA</Text>
              <Text style={styles.drinkHeroName}>{drinkOfDay.name}</Text>
              {drinkOfDay.subtitle ? (
                <Text style={styles.drinkHeroSub} numberOfLines={1}>{drinkOfDay.subtitle}</Text>
              ) : null}
              <View style={styles.drinkHeroMeta}>
                <View style={[styles.drinkHeroTag, { backgroundColor: drinkOfDay.accent + '22' }]}>
                  <Text style={[styles.drinkHeroTagText, { color: drinkOfDay.accent }]}>⏱ {drinkOfDay.time}</Text>
                </View>
                <View style={[styles.drinkHeroTag, { backgroundColor: drinkOfDay.accent + '22' }]}>
                  <Text style={[styles.drinkHeroTagText, { color: drinkOfDay.accent }]}>🎯 {drinkOfDay.difficulty}</Text>
                </View>
                <View style={[styles.drinkHeroTag, { backgroundColor: drinkOfDay.accent + '33' }]}>
                  <Text style={[styles.drinkHeroTagText, { color: drinkOfDay.accent }]}>{drinkOfDay.base}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.drinkHeroArrow, { color: drinkOfDay.accent }]}>›</Text>
          </TouchableOpacity>
        )}

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          {quickActions.map(action => (
            <TouchableOpacity key={action.label} onPress={action.onPress} activeOpacity={0.8} style={styles.actionBtn}>
              <View style={styles.actionCircle}>
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SURPRISE RESULT */}
        {surprisePick && (
          <View style={styles.surpriseCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.surpriseLabel}>✨ Que tal este drink?</Text>
              <Text style={styles.surpriseName}>{surprisePick.drink.name}</Text>
              <Text style={styles.surpriseMissing}>Falta só: {surprisePick.missing.join(', ')}</Text>
            </View>
            <View style={styles.surpriseActions}>
              <TouchableOpacity
                onPress={() => { setSurprisePick(null); navigation.navigate('DrinkDetail', { drinkId: surprisePick.drink.id }); }}
                style={styles.surpriseBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.surpriseBtnText}>Ver receita →</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSurprisePick(null)} style={styles.surpriseDismiss} activeOpacity={0.7}>
                <Text style={styles.surpriseDismissText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MOODS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Qual o clima?</Text>
            <TouchableOpacity onPress={() => setActiveMood(null)}>
              <Text style={styles.sectionLink}>{activeMood ? 'Limpar' : 'Ver todos'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {moods.map(mood => (
              <TouchableOpacity
                key={mood.id}
                onPress={() => { Haptics.selectionAsync(); setActiveMood(activeMood === mood.id ? null : mood.id); }}
                activeOpacity={0.8}
                style={[styles.moodChip, activeMood === mood.id && styles.moodChipActive]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, activeMood === mood.id && styles.moodLabelActive]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* DRINK CARDS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {activeMood ? moods.find(m => m.id === activeMood)?.label : 'Mais populares'} 🔥
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Cardapio')}>
              <Text style={styles.sectionLink}>Ver cardápio</Text>
            </TouchableOpacity>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>🫗</Text>
              <Text style={styles.emptyTitle}>Nenhum drink encontrado</Text>
              <Text style={styles.emptySub}>Tente outro ingrediente!</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filtered.map(drink => (
                <DrinkCardList
                  key={drink.id}
                  drink={drink}
                  isFavorite={favorites.includes(drink.id)}
                  onPress={() => navigation.navigate('DrinkDetail', { drinkId: drink.id })}
                  onFavorite={() => toggleFavorite(drink.id)}
                  rating={ratings[drink.id]}
                />
              ))}
            </View>
          )}
        </View>

      </ScrollView>
      <BottomNav active="Home" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.background },
  scroll:  { flex: 1 },
  content: { paddingBottom: 100 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm,
    gap: 12,
  },
  greeting:     { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, letterSpacing: 0.2 },
  title:        { fontSize: 22, fontFamily: fonts.displayBold, color: colors.text, lineHeight: 28, marginTop: 2 },
  titleAccent:  { fontFamily: fonts.displayItal, color: colors.primary },

  // Avatar
  avatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  avatarText: { fontSize: 17, fontFamily: fonts.black, color: colors.gold, letterSpacing: -0.5 },

  // Search
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, paddingHorizontal: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  searchIcon:      { fontSize: 16, marginRight: 8 },
  searchInput:     { flex: 1, paddingVertical: 13, fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  searchClear:     { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
  searchClearText: { fontSize: 16, color: colors.textMuted, fontFamily: fonts.bold, lineHeight: 18 },

  // Drink do Dia — hero
  drinkHero: {
    marginHorizontal: spacing.xl, borderRadius: radius.xl,
    padding: spacing.lg, paddingVertical: 22,
    flexDirection: 'row', alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 5,
  },
  drinkHeroContent:  { flex: 1 },
  drinkHeroLabel:    { fontSize: 10, fontFamily: fonts.extraBold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 },
  drinkHeroName:     { fontSize: 26, fontFamily: fonts.displayBold, color: colors.dark, lineHeight: 30, marginBottom: 4 },
  drinkHeroSub:      { fontSize: 12, fontFamily: fonts.semiBold, color: colors.dark, opacity: 0.55, marginBottom: 12 },
  drinkHeroMeta:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  drinkHeroTag:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  drinkHeroTagText:  { fontSize: 11, fontFamily: fonts.extraBold },
  drinkHeroArrow:    { fontSize: 30, opacity: 0.5, marginLeft: 8 },

  // Quick Actions
  quickActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginHorizontal: spacing.xl, marginBottom: spacing.lg,
  },
  actionBtn: { alignItems: 'center', gap: 8, flex: 1 },
  actionCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3,
  },
  actionEmoji: { fontSize: 24 },
  actionLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.textMuted, textAlign: 'center', lineHeight: 14 },

  // Surprise result
  surpriseCard: {
    marginHorizontal: spacing.xl, marginBottom: spacing.md,
    backgroundColor: '#0D1B2A', borderRadius: radius.xl,
    padding: spacing.lg, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#1E3550',
  },
  surpriseLabel:       { fontSize: 11, color: '#FFD966', fontFamily: fonts.extraBold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  surpriseName:        { fontSize: 18, fontFamily: fonts.extraBold, color: '#fff' },
  surpriseMissing:     { fontSize: 12, fontFamily: fonts.semiBold, color: '#C0392B', marginTop: 4 },
  surpriseActions:     { alignItems: 'flex-end', gap: 8, marginLeft: 12 },
  surpriseBtn:         { backgroundColor: '#FFD966', borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 14 },
  surpriseBtnText:     { fontSize: 12, fontFamily: fonts.extraBold, color: '#1C1A14' },
  surpriseDismiss:     { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  surpriseDismissText: { fontSize: 11, color: '#888', fontFamily: fonts.extraBold },

  // Sections
  section:       { paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:  { fontSize: 16, fontFamily: fonts.extraBold, color: colors.text },
  sectionLink:   { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary },

  // Moods
  moodScroll:     { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  moodChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, marginRight: 10 },
  moodChipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  moodEmoji:      { fontSize: 14 },
  moodLabel:      { fontSize: 12, fontFamily: fonts.extraBold, color: '#555' },
  moodLabelActive:{ color: '#fff' },

  // Empty
  empty:      { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text, marginTop: 8 },
  emptySub:   { fontSize: 12, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 4 },
});
