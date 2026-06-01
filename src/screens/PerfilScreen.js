import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import BottomNav from '../components/BottomNav';
import drinks from '../data/drinks';

const badges = [
  { emoji: '🍹', label: 'Primeiro drink',      earned: true  },
  { emoji: '🔥', label: '5 drinks feitos',     earned: true  },
  { emoji: '⭐', label: '10 favoritos',        earned: true  },
  { emoji: '🥃', label: 'Bartender Pro',       earned: false },
  { emoji: '🌍', label: 'World Tour',          earned: false },
  { emoji: '🏆', label: 'Mestre dos drinques', earned: false },
];

const weekBars = [
  { day: 'Seg', v: 0 }, { day: 'Ter', v: 1 }, { day: 'Qua', v: 2 },
  { day: 'Qui', v: 1 }, { day: 'Sex', v: 3 }, { day: 'Sáb', v: 2 }, { day: 'Dom', v: 1 },
];

const destilados = [
  { name: 'Rum',     pct: 38, color: '#C84B31' },
  { name: 'Gin',     pct: 28, color: '#1565C0' },
  { name: 'Vodka',   pct: 20, color: '#7B1FA2' },
  { name: 'Cachaça', pct: 14, color: '#2E7D32' },
];

const configItems = [
  { icon: '🔔', label: 'Notificações',  sub: 'Novidades e receitas',  danger: false },
  { icon: '🌙', label: 'Modo escuro',   sub: 'Em breve',              danger: false },
  { icon: '🌍', label: 'Idioma',        sub: 'Português (BR)',        danger: false },
  { icon: '⭐', label: 'Avaliar o app', sub: 'Deixe seu feedback',    danger: false },
  { icon: '💬', label: 'Fale conosco',  sub: 'Sugestões e problemas', danger: false },
  { icon: '🚪', label: 'Sair',          sub: '',                      danger: true  },
];

export default function PerfilScreen({ navigation }) {
  const { favorites, history } = useApp();
  const { signOut, user } = useAuth();
  const [section, setSection] = useState('stats');

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const historyDrinks = history.slice(0, 5).map(h => ({
    ...drinks.find(d => d.id === h.id),
    date: new Date(h.date).toLocaleDateString('pt-BR', { weekday: 'short', hour: '2-digit', minute: '2-digit' }),
  })).filter(Boolean);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Meu <Text style={styles.titleAccent}>Perfil</Text>
          </Text>
          <AppIcon size={38} />
        </View>

        {/* AVATAR */}
        <View style={styles.avatarRow}>
          <View style={styles.avatar}>
            <Text style={{ fontSize: 32 }}>🧑‍🍳</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.userName}>{user?.user_metadata?.name || 'Bartender'}</Text>
            <Text style={styles.userRole}>{user?.email || 'Bartender Amador 🥃'}</Text>
            <View style={styles.levelRow}>
              <View style={styles.levelBg}>
                <View style={styles.levelFill}/>
              </View>
              <Text style={styles.levelText}>Nível 3</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={{ fontSize: 15 }}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* STAT CARDS */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Drinks feitos', value: String(history.length || 0), emoji: '🍹' },
            { label: 'Favoritos',     value: String(favorites.length),    emoji: '❤️' },
            { label: 'Semanas ativo', value: '3',                         emoji: '📅' },
          ].map(({ label, value, emoji }) => (
            <View key={label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{emoji}</Text>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* SECTION TABS */}
        <View style={styles.tabs}>
          {[
            { id: 'stats',      label: '📊 Atividade'  },
            { id: 'historico',  label: '🕐 Histórico'  },
            { id: 'conquistas', label: '🏆 Conquistas' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setSection(tab.id)}
              style={[styles.tab, section === tab.id && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, section === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg, gap: 12 }}>

          {/* ── ATIVIDADE ── */}
          {section === 'stats' && (
            <>
              <View style={styles.featuredCard}>
                <Text style={styles.featuredLabel}>✦ Drink favorito</Text>
                <Text style={styles.featuredName}>Mojito 🍃</Text>
                <Text style={styles.featuredSub}>Preparado 8 vezes • Nota média 5.0 ⭐</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Drinks esta semana</Text>
                <View style={styles.barChart}>
                  {weekBars.map(({ day, v }) => (
                    <View key={day} style={styles.barCol}>
                      <View style={[styles.bar, { height: v === 0 ? 4 : v * 14, backgroundColor: v > 0 ? (day === 'Dom' ? colors.primary : colors.dark) : '#F0F0EC' }]}/>
                      <Text style={[styles.barLabel, day === 'Dom' && { color: colors.primary }]}>{day}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Destilados mais usados</Text>
                {destilados.map(({ name, pct, color }) => (
                  <View key={name} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={styles.destName}>{name}</Text>
                      <Text style={[styles.destPct, { color }]}>{pct}%</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]}/>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── HISTÓRICO ── */}
          {section === 'historico' && (
            historyDrinks.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={{ fontSize: 32 }}>📭</Text>
                <Text style={styles.emptySectionText}>Nenhum drink preparado ainda</Text>
              </View>
            ) : (
              historyDrinks.map((drink, i) => (
                <View key={i} style={styles.histCard}>
                  <View style={[styles.histGlass, { backgroundColor: drink.color }]}>
                    <Text style={{ fontSize: 20 }}>🍹</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histName}>{drink.name}</Text>
                    <Text style={styles.histDate}>🕐 {drink.date}</Text>
                  </View>
                  <TouchableOpacity style={styles.arrowBtn}>
                    <Text style={styles.arrow}>›</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          )}

          {/* ── CONQUISTAS ── */}
          {section === 'conquistas' && (
            <>
              <View style={styles.badgesGrid}>
                {badges.map((b, i) => (
                  <View key={i} style={[styles.badgeCard, !b.earned && { opacity: 0.5 }]}>
                    <View style={[styles.badgeIcon, b.earned && { backgroundColor: colors.dark }]}>
                      <Text style={{ fontSize: 22 }}>{b.earned ? b.emoji : '🔒'}</Text>
                    </View>
                    <Text style={[styles.badgeLabel, !b.earned && { color: colors.textLight }]}>{b.label}</Text>
                    {b.earned && <Text style={styles.badgeEarned}>✦ Conquistado</Text>}
                  </View>
                ))}
              </View>

              <View style={styles.featuredCard}>
                <Text style={styles.featuredLabel}>✦ Próximo nível</Text>
                <Text style={styles.featuredName}>Bartender Pro 🥃</Text>
                <Text style={styles.featuredSub}>Prepare mais 6 drinks diferentes para desbloquear</Text>
                <View style={[styles.progressBg, { marginTop: 10 }]}>
                  <View style={[styles.progressFill, { width: '60%', backgroundColor: colors.primary }]}/>
                </View>
                <Text style={[styles.featuredSub, { marginTop: 6 }]}>6 de 10 drinks únicos</Text>
              </View>
            </>
          )}

        </View>

        {/* CONFIGURAÇÕES */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.xl }}>
          <Text style={styles.sectionLabel}>Configurações</Text>
          <View style={styles.configCard}>
            {configItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                onPress={item.danger ? handleLogout : undefined}
                style={[styles.configItem, i < configItems.length - 1 && styles.configBorder]}
              >
                <View style={[styles.configIcon, item.danger && { backgroundColor: '#FFF0F0' }]}>
                  <Text style={{ fontSize: 16 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.configLabel, item.danger && { color: colors.primary }]}>{item.label}</Text>
                  {item.sub ? <Text style={styles.configSub}>{item.sub}</Text> : null}
                </View>
                {!item.danger && <Text style={styles.arrow}>›</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
      <BottomNav active="Perfil" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md },
  title: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.text },
  titleAccent: { fontFamily: fonts.displayItal, color: colors.primary },

  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  userName: { fontSize: 18, fontFamily: fonts.black, color: colors.text },
  userRole: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 2 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  levelBg:   { flex: 1, height: 6, backgroundColor: '#F0F0EC', borderRadius: 3, overflow: 'hidden' },
  levelFill: { height: '100%', width: '60%', backgroundColor: colors.primary, borderRadius: 3 },
  levelText: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.textMuted },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F2', alignItems: 'center', justifyContent: 'center' },

  statsGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: spacing.xl, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, alignItems: 'center', borderWidth: 2, borderColor: '#F5F5F5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 20, fontFamily: fonts.black, color: colors.text, marginTop: 4 },
  statLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.textLight, marginTop: 2, textAlign: 'center', lineHeight: 13 },

  tabs: { flexDirection: 'row', marginHorizontal: spacing.xl, backgroundColor: '#F0F0EC', borderRadius: radius.md, padding: 4, gap: 3 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 12 },
  tabActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: colors.textLight },
  tabLabelActive: { color: colors.text },

  featuredCard: { backgroundColor: colors.dark, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,210,80,0.1)' },
  featuredLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: '#B8860B', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  featuredName:  { fontSize: 20, fontFamily: fonts.extraBold, color: '#fff' },
  featuredSub:   { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 3 },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: '#F5F5F5' },
  cardTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text, marginBottom: 14 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 56 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 9, fontFamily: fonts.extraBold, color: colors.textLight },

  destName: { fontSize: 12, fontFamily: fonts.extraBold, color: '#555' },
  destPct:  { fontSize: 12, fontFamily: fonts.extraBold },
  progressBg:   { height: 6, backgroundColor: '#F0F0EC', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },

  histCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#F5F5F5' },
  histGlass: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  histName: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },
  histDate: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 2 },
  arrowBtn: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  arrow: { fontSize: 18, color: '#aaa' },

  badgesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badgeCard: { width: '30%', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 8, borderWidth: 2, borderColor: '#F5F5F5' },
  badgeIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#ECECEC', alignItems: 'center', justifyContent: 'center' },
  badgeLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.text, textAlign: 'center', lineHeight: 13 },
  badgeEarned: { fontSize: 9, fontFamily: fonts.extraBold, color: '#B8860B' },

  sectionLabel: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  configCard: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 2, borderColor: '#F5F5F5' },
  configItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: spacing.md },
  configBorder: { borderBottomWidth: 1.5, borderBottomColor: '#F5F5F5' },
  configIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5F5F2', alignItems: 'center', justifyContent: 'center' },
  configLabel: { fontSize: 14, fontFamily: fonts.bold, color: colors.text },
  configSub:   { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 1 },

  emptySection: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptySectionText: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.textLight },
});
