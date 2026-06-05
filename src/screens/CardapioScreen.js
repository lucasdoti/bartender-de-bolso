import { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import { DrinkCardList, DrinkCardGrid } from '../components/DrinkCard';
import drinks from '../data/drinks';

const filters = [
  { id: 'todos',    label: 'Todos',      emoji: '🍸' },
  { id: 'popular',  label: 'Populares',  emoji: '🔥' },
  { id: 'calor',    label: 'Pro calor',  emoji: '☀️' },
  { id: 'frio',     label: 'Pro frio',   emoji: '🍂' },
  { id: 'date',     label: 'Pra date',   emoji: '🥂' },
  { id: 'solo',     label: 'Só eu',      emoji: '🌙' },
  { id: 'festas',   label: 'Festa',      emoji: '🪩' },
  { id: 'classico', label: 'Clássicos',  emoji: '⭐' },
  { id: 'brasil',   label: 'Brasileiro', emoji: '🇧🇷' },
];

const bases = ['Todos', 'Rum', 'Gin', 'Vodka', 'Tequila', 'Cachaça', 'Whisky', 'Bourbon', 'Aperol', 'Campari'];

const families = [
  { id: 'todas',          label: 'Todas',        emoji: '🍹' },
  { id: 'negroni',        label: 'Negroni Style', emoji: '🍊', ids: [5, 38, 33, 41, 49] },
  { id: 'sour',           label: 'Sour',          emoji: '🍋', ids: [15, 46, 48, 37, 2, 12, 51] },
  { id: 'spritz',         label: 'Spritz',        emoji: '🥂', ids: [16, 29, 30, 24] },
  { id: 'tropical',       label: 'Tropical',      emoji: '🌺', ids: [3, 22, 23, 18] },
  { id: 'caipirinha',     label: 'Caipirinha',    emoji: '🍈', ids: [17, 36, 32, 20, 49] },
  { id: 'martini',        label: 'Martini',       emoji: '🍸', ids: [8, 9, 19, 50, 52] },
  { id: 'collins',        label: 'Collins',       emoji: '🧊', ids: [7, 27, 44, 4, 10, 31] },
  { id: 'bourbon_stirred',label: 'Stirred',       emoji: '🥃', ids: [14, 45, 38, 35, 46] },
  { id: 'cafe',           label: 'Café',          emoji: '☕', ids: [19, 43] },
];

export default function CardapioScreen({ navigation }) {
  const { favorites, toggleFavorite } = useApp();
  const [filter, setFilter]       = useState('todos');
  const [base, setBase]           = useState('Todos');
  const [family, setFamily]       = useState('todas');
  const [search, setSearch]       = useState('');
  const [view, setView]           = useState('list');
  const [showBases, setShowBases]     = useState(false);
  const [showFamilies, setShowFamilies] = useState(false);

  const activeFamilyIds = families.find(f => f.id === family)?.ids;

  const filtered = drinks
    .filter(d => {
      const matchFilter = filter === 'todos' || d.tags.includes(filter);
      const matchBase   = base === 'Todos' || d.base === base;
      const matchFamily = !activeFamilyIds || activeFamilyIds.includes(d.id);
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.base.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchBase && matchFamily && matchSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  const ListHeader = (
    <View>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.count}>{filtered.length} drinks</Text>
          <Text style={styles.title}>
            Cardápio <Text style={styles.titleAccent}>completo</Text>
          </Text>
        </View>
        <AppIcon size={38} />
      </View>

      {/* SEARCH + FILTROS + VIEW TOGGLE */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar drink..."
            placeholderTextColor={colors.textLight}
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity
          onPress={() => { setShowBases(!showBases); setShowFamilies(false); }}
          activeOpacity={0.8}
          style={[styles.filterBtn, base !== 'Todos' && styles.filterBtnActive]}
        >
          <Text style={styles.filterBtnEmoji}>🥃</Text>
          {base !== 'Todos' && <View style={styles.filterDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setShowFamilies(!showFamilies); setShowBases(false); }}
          activeOpacity={0.8}
          style={[styles.filterBtn, family !== 'todas' && styles.filterBtnActive]}
        >
          <Text style={styles.filterBtnEmoji}>🍹</Text>
          {family !== 'todas' && <View style={styles.filterDot} />}
        </TouchableOpacity>

        <View style={styles.viewToggle}>
          {[{ v: 'list', icon: '☰' }, { v: 'grid', icon: '⊞' }].map(({ v, icon }) => (
            <TouchableOpacity
              key={v}
              onPress={() => setView(v)}
              style={[styles.viewBtn, view === v && styles.viewBtnActive]}
            >
              <Text style={{ fontSize: 16 }}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* DROPDOWN — DESTILADO */}
      {showBases && (
        <View style={styles.basesGrid}>
          {bases.map(b => (
            <TouchableOpacity
              key={b}
              onPress={() => { setBase(b); setShowBases(false); }}
              style={[styles.baseChip, base === b && styles.baseChipActive]}
            >
              <Text style={[styles.baseLabel, base === b && { color: '#fff' }]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* DROPDOWN — FAMÍLIA */}
      {showFamilies && (
        <View style={styles.basesGrid}>
          {families.map(f => (
            <TouchableOpacity
              key={f.id}
              onPress={() => { setFamily(f.id); setShowFamilies(false); }}
              style={[styles.baseChip, family === f.id && styles.baseChipActive]}
            >
              <Text style={[styles.baseLabel, family === f.id && { color: '#fff' }]}>
                {f.emoji} {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* FILTER CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(f => (
          <TouchableOpacity
            key={f.id}
            onPress={() => setFilter(f.id)}
            activeOpacity={0.8}
            style={[styles.chip, filter === f.id && styles.chipActive]}
          >
            <Text style={styles.chipEmoji}>{f.emoji}</Text>
            <Text style={[styles.chipLabel, filter === f.id && styles.chipLabelActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </View>
  );

  const EmptyState = (
    <View style={styles.empty}>
      <Text style={{ fontSize: 40 }}>🫗</Text>
      <Text style={styles.emptyTitle}>Nenhum drink encontrado</Text>
      <Text style={styles.emptySub}>Tente outro filtro!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {view === 'list' ? (
        <FlatList
          key="list"
          data={filtered}
          keyExtractor={d => String(d.id)}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 12 }}>
              <DrinkCardList
                drink={item}
                isFavorite={favorites.includes(item.id)}
                onPress={() => navigation.navigate('DrinkDetail', { drinkId: item.id })}
                onFavorite={() => toggleFavorite(item.id)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          key="grid"
          data={filtered}
          keyExtractor={d => String(d.id)}
          numColumns={2}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={EmptyState}
          columnWrapperStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: 12 }}>
              <DrinkCardGrid
                drink={item}
                isFavorite={favorites.includes(item.id)}
                onPress={() => navigation.navigate('DrinkDetail', { drinkId: item.id })}
                onFavorite={() => toggleFavorite(item.id)}
              />
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav active="Cardapio" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.md,
  },
  count: { fontSize: 12, fontFamily: fonts.bold, color: colors.textLight },
  title: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.text, lineHeight: 28 },
  titleAccent: { fontFamily: fonts.displayItal, color: colors.primary },

  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchWrapper: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 15, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  filterBtn: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  filterBtnEmoji: { fontSize: 16 },
  filterDot: {
    position: 'absolute', top: 6, right: 6,
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary,
  },

  viewToggle: { flexDirection: 'row', backgroundColor: '#F0F0EC', borderRadius: 12, padding: 3, gap: 2 },
  viewBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewBtnActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },

  // Scroll horizontal de filtros — altura automática, sem cortes
  filterScroll: { flexGrow: 0, marginHorizontal: -spacing.xl, marginBottom: 12 },
  filterContent: { paddingHorizontal: spacing.xl, gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 50,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  chipEmoji: { fontSize: 14 },
  chipLabel: { fontSize: 13, fontFamily: fonts.extraBold, color: '#666' },
  chipLabelActive: { color: '#fff' },

  basesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  baseChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, backgroundColor: '#F5F5F2' },
  baseChipActive: { backgroundColor: colors.dark },
  baseLabel: { fontSize: 12, fontFamily: fonts.extraBold, color: '#555' },

  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.text, marginTop: 12 },
  emptySub: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 6 },
});
