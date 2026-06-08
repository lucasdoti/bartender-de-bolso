import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import { DrinkCardList } from '../components/DrinkCard';
import { useDrinks, ibaOrder } from '../hooks/useDrinks';

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
  const { favorites, toggleFavorite, ingredients, ratings } = useApp();
  const drinks = useDrinks();
  const [activeMood, setActiveMood]   = useState(null);
  const [search, setSearch]           = useState('');
  const [surprisePick, setSurprisePick] = useState(null);

  const surpriseMe = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const normalized = ingredients.map(norm);

    if (normalized.length === 0) {
      navigation.navigate('MeuBar');
      return;
    }

    const scored = drinks
      .filter(d => (d.needs || []).length > 0)
      .map(d => {
        const needs = d.needs || [];
        const matched = needs.filter(n => normalized.includes(n)).length;
        return { drink: d, matched, ratio: matched / needs.length };
      })
      .filter(s => s.matched > 0)
      .sort((a, b) => b.ratio - a.ratio || b.matched - a.matched);

    if (scored.length === 0) {
      navigation.navigate('MeuBar');
      return;
    }

    const candidates = scored.slice(0, 5);
    const { drink: pick, ratio } = candidates[Math.floor(Math.random() * candidates.length)];

    if (ratio === 1) {
      setSurprisePick(null);
      navigation.navigate('DrinkDetail', { drinkId: pick.id });
    } else {
      const missing = (pick.needs || [])
        .filter(n => !normalized.includes(n))
        .map(n => {
          const ing = pick.ingredients?.find(i => i.id === n);
          return ing ? ing.name : n;
        });
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
    if (h < 12) return 'Bom dia ☀️';
    if (h < 18) return 'Boa tarde 🌤';
    return 'Boa noite 🌙';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.title}>
              O que vamos{'\n'}
              <Text style={styles.titleAccent}>preparar hoje?</Text>
            </Text>
          </View>
          <AppIcon size={46} />
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
        </View>

        {/* CTA PRINCIPAL — BARTENDER IA */}
        <TouchableOpacity onPress={() => navigation.navigate('BartenderIA')} activeOpacity={0.85} style={styles.ctaMain}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaMainLabel}>✦ Inteligência artificial</Text>
            <Text style={styles.ctaMainTitle}>Fale com o{'\n'}Bartender 💬</Text>
            <Text style={styles.ctaMainSub}>Descreva o que quer e eu sugiro o drink perfeito</Text>
          </View>
          <View style={styles.ctaMainIcon}>
            <Text style={{ fontSize: 36 }}>🍸</Text>
          </View>
        </TouchableOpacity>

        {/* CTAs SECUNDÁRIOS — SURPREENDA-ME + MEU BAR */}
        <View style={styles.ctaRow}>
          <TouchableOpacity onPress={surpriseMe} activeOpacity={0.85} style={[styles.ctaSmall, { backgroundColor: '#0D1B2A' }]}>
            <Text style={{ fontSize: 26, marginBottom: 8 }}>✨</Text>
            <Text style={styles.ctaSmallTitle}>Surpreenda-me</Text>
            <Text style={styles.ctaSmallSub}>Drink do momento</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('MeuBar')} activeOpacity={0.85} style={[styles.ctaSmall, { backgroundColor: '#1C1A14' }]}>
            <Text style={{ fontSize: 26, marginBottom: 8 }}>🥃</Text>
            <Text style={styles.ctaSmallTitle}>Meu Bar</Text>
            <Text style={styles.ctaSmallSub}>O que tenho em casa</Text>
          </TouchableOpacity>
        </View>

        {/* FALTA SÓ ISSO — resultado parcial do Surpreenda-me */}
        {surprisePick && (
          <View style={styles.surpriseCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.surpriseLabel}>✨ Que tal este drink?</Text>
              <Text style={styles.surpriseName}>{surprisePick.drink.name}</Text>
              <Text style={styles.surpriseMissing}>
                Falta só: {surprisePick.missing.join(', ')}
              </Text>
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

        {/* MODO FESTA */}
        <TouchableOpacity onPress={() => navigation.navigate('Festa')} activeOpacity={0.85} style={styles.ctaFesta}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaFestaLabel}>✦ Novo</Text>
            <Text style={styles.ctaFestaTitle}>Modo Festa 🎉</Text>
            <Text style={styles.ctaFestaSub}>Compare quem bebeu mais com os amigos</Text>
          </View>
          <View style={styles.ctaFestaIcon}>
            <Text style={{ fontSize: 32 }}>🏆</Text>
          </View>
        </TouchableOpacity>

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
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.xl, paddingBottom: 0 },
  greeting: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, letterSpacing: 0.5 },
  title: { fontSize: 28, fontFamily: fonts.displayBold, color: colors.text, lineHeight: 34, marginTop: 2 },
  titleAccent: { fontFamily: fonts.displayItal, color: colors.primary },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', margin: spacing.xl, marginTop: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 13, fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  ctaMain: { marginHorizontal: spacing.xl, backgroundColor: '#120D24', borderRadius: radius.xl, padding: spacing.lg, paddingVertical: 22, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#2D1854', shadowColor: '#9B6FD4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  ctaMainLabel: { fontSize: 11, color: '#9B6FD4', fontFamily: fonts.extraBold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  ctaMainTitle: { fontSize: 22, fontFamily: fonts.extraBold, color: '#fff', lineHeight: 28 },
  ctaMainSub: { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 6 },
  ctaMainIcon: { width: 72, height: 72, borderRadius: radius.lg, backgroundColor: '#2D1854', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  ctaRow: { flexDirection: 'row', marginHorizontal: spacing.xl, gap: 12, marginTop: 12 },
  ctaSmall: { flex: 1, borderRadius: radius.xl, padding: spacing.md, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  ctaSmallTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: '#fff', textAlign: 'center' },
  ctaSmallSub: { fontSize: 11, fontFamily: fonts.semiBold, color: '#888', marginTop: 3, textAlign: 'center' },
  surpriseCard: { marginHorizontal: spacing.xl, marginTop: 12, backgroundColor: '#0D1B2A', borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1E3550' },
  surpriseLabel: { fontSize: 11, color: '#FFD966', fontFamily: fonts.extraBold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  surpriseName: { fontSize: 18, fontFamily: fonts.extraBold, color: '#fff' },
  surpriseMissing: { fontSize: 12, fontFamily: fonts.semiBold, color: '#C0392B', marginTop: 4 },
  surpriseActions: { alignItems: 'flex-end', gap: 8, marginLeft: 12 },
  surpriseBtn: { backgroundColor: '#FFD966', borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 14 },
  surpriseBtnText: { fontSize: 12, fontFamily: fonts.extraBold, color: '#1C1A14' },
  surpriseDismiss: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  surpriseDismissText: { fontSize: 11, color: '#888', fontFamily: fonts.extraBold },

  ctaFesta: { marginHorizontal: spacing.xl, marginTop: 12, backgroundColor: '#14201A', borderRadius: radius.xl, padding: spacing.lg, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1F3D2E', shadowColor: '#2ECC71', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 6 },
  ctaFestaLabel: { fontSize: 11, color: '#2ECC71', fontFamily: fonts.extraBold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  ctaFestaTitle: { fontSize: 20, fontFamily: fonts.extraBold, color: '#fff', lineHeight: 26 },
  ctaFestaSub: { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 4 },
  ctaFestaIcon: { width: 60, height: 60, borderRadius: radius.lg, backgroundColor: '#1F3D2E', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.text },
  sectionLink: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary },
  moodScroll: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
  moodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, marginRight: 10 },
  moodChipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  moodEmoji: { fontSize: 14 },
  moodLabel: { fontSize: 12, fontFamily: fonts.extraBold, color: '#555' },
  moodLabelActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text, marginTop: 8 },
  emptySub: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 4 },
});
