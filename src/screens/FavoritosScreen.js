// ─── FAVORITOS ────────────────────────────────────────────────────────────────
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import { DrinkCardList } from '../components/DrinkCard';
import drinks from '../data/drinks';

export function FavoritosScreen({ navigation }) {
  const { favorites, toggleFavorite, ratings } = useApp();
  const [sort, setSort] = useState('recentes');
  const diffOrder = { Fácil: 1, Médio: 2, Difícil: 3 };
  const favDrinks = (() => {
    const list = drinks.filter(d => favorites.includes(d.id));
    if (sort === 'nome')        return [...list].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (sort === 'dificuldade') return [...list].sort((a, b) => (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0));
    if (sort === 'avaliados')   return [...list].sort((a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0));
    return [...list].sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));
  })();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.count}>{favDrinks.length} salvos</Text>
          <Text style={styles.title}>
            Meus <Text style={styles.titleAccent}>favoritos</Text>
          </Text>
        </View>
        <AppIcon size={38} />
      </View>

      {/* SORT */}
      <View style={styles.sortRow}>
        {[
          { id: 'recentes',    label: 'Recentes'    },
          { id: 'nome',        label: 'A–Z'          },
          { id: 'dificuldade', label: 'Mais fáceis'  },
          { id: 'avaliados',   label: '⭐ Avaliados' },
        ].map(s => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setSort(s.id)}
            activeOpacity={0.8}
            style={[styles.sortChip, sort === s.id && styles.sortChipActive]}
          >
            <Text style={[styles.sortLabel, sort === s.id && { color: '#fff' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {favDrinks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 48 }}>🤍</Text>
          <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
          <Text style={styles.emptySub}>Explore o cardápio e salve seus drinks preferidos!</Text>
        </View>
      ) : (
        <FlatList
          data={favDrinks}
          keyExtractor={d => String(d.id)}
          renderItem={({ item }) => (
            <DrinkCardList
              drink={item}
              isFavorite={favorites.includes(item.id)}
              onPress={() => navigation.navigate('DrinkDetail', { drinkId: item.id })}
              onFavorite={() => toggleFavorite(item.id)}
              rating={ratings[item.id]}
            />
          )}
          contentContainerStyle={{ padding: spacing.xl, gap: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNav active="Favoritos" navigation={navigation} />
    </SafeAreaView>
  );
}

export default FavoritosScreen;

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: spacing.xl, paddingBottom: spacing.md },
  count: { fontSize: 12, fontFamily: fonts.bold, color: colors.textLight },
  title: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.text, lineHeight: 28 },
  titleAccent: { fontFamily: fonts.displayItal, color: colors.primary },
  sortRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  sortChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  sortChipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  sortLabel: { fontSize: 12, fontFamily: fonts.extraBold, color: '#888' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: colors.text, marginTop: 16 },
  emptySub: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
});
