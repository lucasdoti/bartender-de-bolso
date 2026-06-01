import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import { DrinkCardList } from '../components/DrinkCard';
import drinks, { ibaOrder } from '../data/drinks';

const moods = [
  { id: 'calor',  label: 'Refrescante',  emoji: '☀️' },
  { id: 'frio',   label: 'Aconchegante', emoji: '🧥' },
  { id: 'date',   label: 'Pra Date',     emoji: '💑' },
  { id: 'solo',   label: 'Só eu',        emoji: '🧍' },
  { id: 'festas', label: 'Festa',        emoji: '🎉' },
];

const INGREDIENT_ALIASES = { limao_taiti: 'limao', limao_siciliano: 'limao' };
function norm(id) { return INGREDIENT_ALIASES[id] || id; }

export default function HomeScreen({ navigation }) {
  const { favorites, toggleFavorite, ingredients } = useApp();
  const [activeMood, setActiveMood] = useState(null);
  const [search, setSearch]         = useState('');

  const surpriseMe = () => {
    const normalized = ingredients.map(norm);
    const canMake = drinks.filter(d =>
      (d.needs || []).length > 0 &&
      (d.needs || []).every(n => normalized.includes(n))
    );
    if (canMake.length === 0) {
      navigation.navigate('MeuBar');
      return;
    }
    const pick = canMake[Math.floor(Math.random() * canMake.length)];
    navigation.navigate('DrinkDetail', { drinkId: pick.id });
  };

  const filtered = drinks
    .filter(d => {
      const matchMood   = activeMood ? d.tags.includes(activeMood) : true;
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.base.toLowerCase().includes(search.toLowerCase());
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

        {/* CTA — SURPREENDA-ME */}
        <TouchableOpacity onPress={surpriseMe} activeOpacity={0.85} style={[styles.ctaCard, { backgroundColor: '#0D1B2A', marginBottom: 12 }]}>
          <View>
            <Text style={styles.ctaLabel}>✦ Drink aleatório</Text>
            <Text style={styles.ctaTitle}>Surpreenda-me 🎲</Text>
            <Text style={styles.ctaSub}>Um drink com o que você tem no bar</Text>
          </View>
          <View style={[styles.ctaIcon, { backgroundColor: '#1A3A5C' }]}>
            <Text style={{ fontSize: 26 }}>🎲</Text>
          </View>
        </TouchableOpacity>

        {/* CTA — MEU BAR */}
        <TouchableOpacity onPress={() => navigation.navigate('MeuBar')} activeOpacity={0.85} style={styles.ctaCard}>
          <View>
            <Text style={styles.ctaLabel}>✦ Feature estrela</Text>
            <Text style={styles.ctaTitle}>O que tenho em casa?</Text>
            <Text style={styles.ctaSub}>Selecione seus ingredientes e descubra</Text>
          </View>
          <View style={styles.ctaIcon}>
            <Text style={{ fontSize: 26 }}>🥃</Text>
          </View>
        </TouchableOpacity>

        {/* MOODS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Qual o clima? 🎯</Text>
            <TouchableOpacity onPress={() => setActiveMood(null)}>
              <Text style={styles.sectionLink}>{activeMood ? 'Limpar' : 'Ver todos'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {moods.map(mood => (
              <TouchableOpacity
                key={mood.id}
                onPress={() => setActiveMood(activeMood === mood.id ? null : mood.id)}
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
              <Text style={{ fontSize: 40 }}>🥲</Text>
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
  ctaCard: { marginHorizontal: spacing.xl, backgroundColor: '#1C1A14', borderRadius: radius.xl, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#1C1A14', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 8 },
  ctaLabel: { fontSize: 11, color: '#B8860B', fontFamily: fonts.extraBold, letterSpacing: 1.2, textTransform: 'uppercase' },
  ctaTitle: { fontSize: 17, fontFamily: fonts.extraBold, color: '#fff', marginTop: 4 },
  ctaSub: { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 2 },
  ctaIcon: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
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
