import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, spacing } from '../theme';

const ACCENT = '#9B6FD4';

export default function AdminScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topTab, setTopTab] = useState('makes');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase.rpc('get_admin_stats');
      if (err) setError(err.message);
      else setStats(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={ACCENT} />
          <Text style={styles.loadingText}>Carregando métricas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.center}>
          <Text style={{ fontSize: 32 }}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const topDrinkKey = { makes: 'top_makes', favorites: 'top_favorites', views: 'top_views' }[topTab];
  const topList = stats?.[topDrinkKey] || [];
  const maxTopVal = Math.max(...topList.map(d => d.count), 1);

  const dailyActivity = stats?.daily_activity || [];
  const maxDaily = Math.max(...dailyActivity.map(d => d.count), 1);

  const summaryCards = [
    { label: 'Usuários',   value: stats?.total_users     ?? '–', emoji: '👤' },
    { label: 'Preparo',    value: stats?.total_makes     ?? '–', emoji: '🥃' },
    { label: 'Favoritos',  value: stats?.total_favorites ?? '–', emoji: '❤️' },
    { label: 'Visitas',    value: stats?.total_views     ?? '–', emoji: '👁️' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={{ fontSize: 20, color: '#fff' }}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.label}>✦ Painel do dono</Text>
            <Text style={styles.title}>Dashboard</Text>
          </View>
          <Text style={{ fontSize: 28 }}>📊</Text>
        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryGrid}>
          {summaryCards.map(({ label, value, emoji }) => (
            <View key={label} style={styles.summaryCard}>
              <Text style={styles.summaryEmoji}>{emoji}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
              <Text style={styles.summaryLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* DAILY ACTIVITY CHART (last 30 days) */}
        <View style={[styles.section, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Atividade — últimos 30 dias</Text>
          <View style={styles.barChart}>
            {dailyActivity.slice(-30).map((d, i) => {
              const h = Math.max(3, (d.count / maxDaily) * 60);
              return (
                <View key={i} style={styles.barCol}>
                  <View style={[styles.bar, { height: h, backgroundColor: d.count > 0 ? ACCENT : '#2A2A2A' }]} />
                </View>
              );
            })}
          </View>
          {dailyActivity.length === 0 && (
            <Text style={styles.emptyText}>Sem dados ainda</Text>
          )}
        </View>

        {/* TOP DRINKS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top drinks</Text>
          <View style={styles.tabRow}>
            {[
              { id: 'makes',     label: 'Feitos'     },
              { id: 'favorites', label: 'Favoritos'  },
              { id: 'views',     label: 'Vistos'     },
            ].map(t => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setTopTab(t.id)}
                style={[styles.tabChip, topTab === t.id && styles.tabChipActive]}
              >
                <Text style={[styles.tabLabel, topTab === t.id && styles.tabLabelActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {topList.length === 0 ? (
            <Text style={styles.emptyText}>Sem dados ainda</Text>
          ) : (
            topList.map((d, i) => (
              <View key={d.drink_id ?? i} style={styles.rankRow}>
                <Text style={styles.rankNum}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{d.name}</Text>
                  <View style={styles.rankBarBg}>
                    <View style={[styles.rankBarFill, { width: `${(d.count / maxTopVal) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.rankCount}>{d.count}</Text>
              </View>
            ))
          )}
        </View>

        {/* TOP INGREDIENTS */}
        {stats?.top_ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes mais usados</Text>
            {stats.top_ingredients.map((ing, i) => (
              <View key={ing.ingredient_id ?? i} style={styles.rankRow}>
                <Text style={styles.rankNum}>{i + 1}</Text>
                <Text style={[styles.rankName, { flex: 1 }]}>{ing.name}</Text>
                <Text style={styles.rankCount}>{ing.count}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#888', marginTop: 8 },
  errorText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#FF5A5A', textAlign: 'center', paddingHorizontal: 32 },
  backBtn: { marginTop: 16, backgroundColor: ACCENT, borderRadius: radius.md, paddingHorizontal: 24, paddingVertical: 10 },
  backBtnText: { fontSize: 14, fontFamily: fonts.extraBold, color: '#fff' },

  header: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md },
  backIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontFamily: fonts.extraBold, color: ACCENT, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 26, fontFamily: fonts.displayBold, color: '#fff', marginTop: 2 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: 10 },
  summaryCard: { width: '47%', backgroundColor: '#1A1A1A', borderRadius: radius.lg, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  summaryEmoji: { fontSize: 24 },
  summaryValue: { fontSize: 26, fontFamily: fonts.black, color: '#fff', marginTop: 4 },
  summaryLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },

  section: { marginHorizontal: spacing.xl, marginTop: spacing.lg, backgroundColor: '#1A1A1A', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: '#2A2A2A' },
  sectionTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: '#fff', marginBottom: 14 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 64, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '100%', borderRadius: 2 },
  emptyText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#555', textAlign: 'center', paddingVertical: 16 },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50, borderWidth: 1.5, borderColor: '#333', backgroundColor: '#111' },
  tabChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  tabLabel: { fontSize: 12, fontFamily: fonts.extraBold, color: '#888' },
  tabLabelActive: { color: '#fff' },

  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  rankNum: { fontSize: 13, fontFamily: fonts.black, color: ACCENT, width: 18, textAlign: 'center' },
  rankName: { fontSize: 13, fontFamily: fonts.bold, color: '#ccc', marginBottom: 4 },
  rankBarBg: { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  rankCount: { fontSize: 13, fontFamily: fonts.extraBold, color: '#fff', minWidth: 28, textAlign: 'right' },
});
