import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Share, Image,
  Modal, Pressable, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import { glassMap } from '../components/glasses/Glasses';
import drinks from '../data/drinks';
import drinkPhotos from '../data/drinkPhotos';

const SCALES = [1, 2, 4, 6];

function scaleAmount(amount, scale) {
  if (scale === 1) return amount;
  if (!amount) return amount;
  const unchanged = ['Q.B.', 'Completar', 'A gosto', 'Opcional'];
  if (unchanged.some(s => amount.includes(s))) return amount;

  // frações: "1/2 un."
  const fracMatch = amount.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1]) / parseInt(fracMatch[2]);
    const unit = fracMatch[3].trim();
    const result = num * scale;
    const fmt = result % 1 === 0 ? result.toString() : result.toFixed(1).replace(/\.0$/, '');
    return unit ? `${fmt} ${unit}` : fmt;
  }

  // números normais: "30ml", "2 col.", "10 folhas"
  const numMatch = amount.match(/^(\d+(?:[,\.]\d+)?)\s*(.*)$/);
  if (!numMatch) return amount;
  const num = parseFloat(numMatch[1].replace(',', '.'));
  const unit = numMatch[2].trim();
  const result = num * scale;
  const fmt = result % 1 === 0 ? result.toString() : result.toFixed(0);
  return unit ? `${fmt}${unit.startsWith('m') || unit.startsWith('g') ? '' : ' '}${unit}` : fmt;
}

const { width: SW, height: SH } = Dimensions.get('window');

function DrinkHero({ drink, GlassComponent }) {
  const [imgError, setImgError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const photo = drinkPhotos[drink.id];

  if (photo && !imgError) {
    return (
      <>
        <TouchableOpacity onPress={() => setFullscreen(true)} activeOpacity={0.9}>
          <Image
            source={{ uri: photo }}
            style={{ width: 110, height: 110, borderRadius: 20 }}
            onError={() => setImgError(true)}
            resizeMode="cover"
          />
        </TouchableOpacity>

        <Modal visible={fullscreen} transparent animationType="fade" statusBarTranslucent>
          <Pressable style={heroStyles.backdrop} onPress={() => setFullscreen(false)}>
            <Image
              source={{ uri: photo }}
              style={{ width: SW, height: SW }}
              resizeMode="cover"
            />
            <Text style={heroStyles.hint}>Toque para fechar</Text>
          </Pressable>
        </Modal>
      </>
    );
  }
  return (
    <View style={[styles.glassBox, { backgroundColor: drink.color, borderColor: drink.accent + '22' }]}>
      {GlassComponent && <GlassComponent size={80} />}
    </View>
  );
}

const heroStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.semiBold,
  },
});

export default function DrinkDetailScreen({ navigation, route }) {
  const { drinkId } = route.params;
  const drink = drinks.find(d => d.id === drinkId);
  const { favorites, toggleFavorite, addToHistory } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab]      = useState('receita');
  const [completedSteps, setCompleted] = useState([]);
  const [marcadoComoFeito, setMarcado] = useState(false);
  const [scale, setScale]              = useState(1);
  const [timerActive, setTimerActive]  = useState(false);
  const [timerLeft, setTimerLeft]      = useState(drink.stirSeconds || 30);

  const GlassComponent = glassMap[drink.id];
  const isFav = favorites.includes(drink.id);
  const method = drink.method || 'built';

  useEffect(() => {
    if (!user) return;
    supabase.from('drink_views').insert({ drink_id: drinkId, user_id: user.id });
  }, [drinkId, user?.id]);

  useEffect(() => {
    if (!timerActive) return;
    if (timerLeft <= 0) {
      setTimerActive(false);
      setTimerLeft(drink.stirSeconds || 30);
      return;
    }
    const id = setTimeout(() => setTimerLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timerActive, timerLeft]);

  const toggleStep = (num) =>
    setCompleted(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);

  const marcarComoFeito = () => {
    if (marcadoComoFeito) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToHistory(drink.id);
    setMarcado(true);
    Alert.alert('Mandou bem! 🍸', `${drink.name} foi adicionado ao seu histórico. Saúde! 🥂`);
  };

  const startTimer = () => {
    setTimerLeft(drink.stirSeconds || 30);
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
    setTimerLeft(drink.stirSeconds || 30);
  };

  const shareDrink = async () => {
    try {
      await Share.share({
        message: `🍸 ${drink.name} — ${drink.subtitle}\n\nVeja a receita completa no Bartender de Bolso!`,
        title: drink.name,
      });
    } catch (_) {}
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* TOP NAV */}
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Ficha do Drink</Text>
        <AppIcon size={38} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HERO */}
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <View style={styles.tags}>
              {drink.tags.slice(0, 3).map(t => (
                <View key={t} style={[styles.tag, { backgroundColor: drink.color }]}>
                  <Text style={[styles.tagText, { color: drink.accent }]}>{t}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.drinkName}>{drink.name}</Text>
            <Text style={styles.drinkSub}>{drink.subtitle}</Text>
            <View style={styles.metaRow}>
              {[
                { label: 'Origem', value: drink.origin },
                { label: 'Ano',    value: drink.year   },
                { label: 'Teor',   value: drink.abv    },
              ].map(({ label, value }) => (
                <View key={label}>
                  <Text style={styles.metaLabel}>{label}</Text>
                  <Text style={styles.metaValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity onPress={shareDrink} style={styles.shareBtn}>
                <Text style={{ fontSize: 15 }}>↗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleFavorite(drink.id); }}
                style={[styles.favBtn, isFav && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              >
                <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <DrinkHero drink={drink} GlassComponent={GlassComponent} />
          </View>
        </View>

        {/* STATS BAR */}
        <View style={styles.statsBar}>
          {[
            { icon: '⏱', label: 'Tempo',        value: drink.time       },
            { icon: '🎯', label: 'Dificuldade',  value: drink.difficulty },
            { icon: '🧪', label: 'Ingredientes', value: `${drink.ingredients.length} itens` },
          ].map(({ icon, label, value }) => (
            <View key={label} style={styles.stat}>
              <Text style={styles.statIcon}>{icon}</Text>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* TABS */}
        <View style={styles.tabs}>
          {[
            { id: 'receita',  label: '🧪 Receita'  },
            { id: 'preparo',  label: '👨‍🍳 Preparo' },
            { id: 'historia', label: '📖 História'  },
          ].map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing.lg }}>

          {/* ── RECEITA ── */}
          {activeTab === 'receita' && (
            <View style={{ gap: 10 }}>
              {/* Seletor de porções */}
              <View style={styles.scaleRow}>
                <Text style={styles.sectionLabel}>Ingredientes</Text>
                <View style={styles.scaleSelector}>
                  {SCALES.map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setScale(s)}
                      style={[styles.scaleBtn, scale === s && { backgroundColor: drink.accent }]}
                    >
                      <Text style={[styles.scaleBtnText, scale === s && { color: '#fff' }]}>
                        {s === 1 ? '1x' : `${s}p`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              {scale > 1 && (
                <Text style={styles.scaleHint}>
                  Receita escalada para {scale} pessoas
                </Text>
              )}
              {drink.ingredients.map((ing, i) => (
                <View key={i} style={styles.ingCard}>
                  <View style={[styles.ingAmount, { backgroundColor: drink.color }]}>
                    <Text style={[styles.ingAmountText, { color: drink.accent }]}>
                      {scaleAmount(ing.amount, scale)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ingName}>{ing.name}</Text>
                    <Text style={styles.ingTip}>💡 {ing.tip}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── PREPARO ── */}
          {activeTab === 'preparo' && (
            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.sectionLabel}>
                  Passo a Passo — {completedSteps.length}/{drink.steps.length}
                </Text>
                {completedSteps.length > 0 && (
                  <TouchableOpacity onPress={() => setCompleted([])}>
                    <Text style={styles.resetBtn}>Reiniciar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Progress */}
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, {
                  width: `${(completedSteps.length / drink.steps.length) * 100}%`,
                  backgroundColor: drink.accent,
                }]}/>
              </View>

              {/* Timer — só drinks mexidos */}
              {method === 'stirred' && (
                <View style={[styles.timerCard, { borderColor: drink.accent + '44' }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.timerLabel}>⏱ Timer de mexida</Text>
                    <Text style={styles.timerSub}>
                      {drink.stirSeconds || 30}s é o tempo ideal para resfriar sem diluir demais
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={timerActive ? stopTimer : startTimer}
                    style={[styles.timerBtn, { backgroundColor: timerActive ? drink.accent : '#1C1A14' }]}
                  >
                    <Text style={styles.timerCount}>
                      {timerActive ? timerLeft : (drink.stirSeconds || 30)}
                    </Text>
                    <Text style={styles.timerBtnLabel}>{timerActive ? 'parar' : 'iniciar'}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Nota — drinks batidos/liquidificador */}
              {(method === 'shaken' || method === 'blended') && (
                <View style={styles.shakenNote}>
                  <Text style={styles.shakenNoteText}>
                    {method === 'blended'
                      ? '🧊 Bata no liquidificador até ficar homogêneo e bem gelado.'
                      : '🤲 Bata na coqueteleira até sentir o metal gelar nas mãos — sinal que está na temperatura certa.'}
                  </Text>
                </View>
              )}

              {drink.steps.map(step => {
                const done = completedSteps.includes(step.num);
                return (
                  <TouchableOpacity
                    key={step.num}
                    onPress={() => toggleStep(step.num)}
                    activeOpacity={0.85}
                    style={[styles.stepCard, done && { backgroundColor: drink.color, borderColor: drink.accent + '44', opacity: 0.8 }]}
                  >
                    <View style={[styles.stepNum, done && { backgroundColor: drink.accent }]}>
                      <Text style={[styles.stepNumText, done && { color: '#fff' }]}>
                        {done ? '✓' : step.num}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.stepTitle, done && { color: drink.accent, textDecorationLine: 'line-through' }]}>
                        {step.title}
                      </Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {completedSteps.length === drink.steps.length && (
                marcadoComoFeito ? (
                  <View style={styles.doneCard}>
                    <Text style={{ fontSize: 28 }}>🥂</Text>
                    <Text style={styles.doneTitle}>Adicionado ao histórico!</Text>
                    <Text style={styles.doneSub}>Que tal avaliar ou favoritar? Saúde! 🥂</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={marcarComoFeito} activeOpacity={0.85} style={styles.fezBtn}>
                    <Text style={{ fontSize: 24 }}>🍸</Text>
                    <Text style={styles.fezBtnTitle}>Marcar como feito</Text>
                    <Text style={styles.fezBtnSub}>Registra no seu histórico</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          )}

          {/* ── HISTÓRIA ── */}
          {activeTab === 'historia' && (
            <View style={{ gap: 16 }}>
              <View style={styles.historyCard}>
                <Text style={styles.sectionLabel}>A história</Text>
                <Text style={styles.historyText}>{drink.history}</Text>
              </View>
              <View style={styles.quoteCard}>
                <Text style={styles.quoteLabel}>✦ Figura famosa</Text>
                <Text style={styles.quoteName}>{drink.famous}</Text>
                <Text style={styles.quoteText}>"{drink.funFact}"</Text>
              </View>
              <View style={[styles.originCard, { backgroundColor: drink.color, borderColor: drink.accent + '22' }]}>
                <Text style={[styles.sectionLabel, { color: drink.accent }]}>🌍 Origem</Text>
                <View style={{ flexDirection: 'row', gap: spacing.xl, marginTop: spacing.sm }}>
                  {[
                    { l: 'País',      v: drink.origin   },
                    { l: 'Época',     v: drink.year     },
                    { l: 'Categoria', v: drink.category },
                  ].map(({ l, v }) => (
                    <View key={l}>
                      <Text style={styles.metaLabel}>{l}</Text>
                      <Text style={[styles.metaValue, { marginTop: 3 }]}>{v}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topNav: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 22, color: colors.text, lineHeight: 24 },
  navTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },

  hero: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, padding: spacing.xl, paddingTop: 0 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 50 },
  tagText: { fontSize: 10, fontFamily: fonts.extraBold },
  drinkName: { fontSize: 30, fontFamily: fonts.displayBold, color: colors.text, lineHeight: 34 },
  drinkSub:  { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: 14 },
  metaLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: colors.textLight, textTransform: 'uppercase', letterSpacing: 0.8 },
  metaValue: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text, marginTop: 2 },
  favBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  shareBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  glassBox: { width: 110, height: 130, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },

  statsBar: { flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 2, borderColor: '#F5F5F5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  stat: { alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 18 },
  statValue: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text },
  statLabel: { fontSize: 10, fontFamily: fonts.semiBold, color: colors.textLight },

  tabs: { flexDirection: 'row', margin: spacing.xl, marginBottom: 0, backgroundColor: '#F0F0EC', borderRadius: radius.md, padding: 4, gap: 3 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  tabLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: colors.textLight },
  tabLabelActive: { color: colors.text },

  sectionLabel: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },

  // Scale
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  scaleSelector: { flexDirection: 'row', gap: 6 },
  scaleBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50, backgroundColor: '#F0F0EC' },
  scaleBtnText: { fontSize: 11, fontFamily: fonts.extraBold, color: '#666' },
  scaleHint: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textMuted, marginBottom: 4 },

  ingCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#F5F5F5' },
  ingAmount: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ingAmountText: { fontSize: 12, fontFamily: fonts.black, textAlign: 'center', lineHeight: 16 },
  ingName: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },
  ingTip:  { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textLight, marginTop: 2 },

  progressBg:   { height: 4, backgroundColor: '#F0F0EC', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', borderRadius: 2 },
  resetBtn: { fontSize: 11, fontFamily: fonts.extraBold, color: colors.primary },

  // Timer
  timerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C1A14', borderRadius: radius.lg, padding: spacing.md, gap: 14, borderWidth: 1 },
  timerLabel: { fontSize: 13, fontFamily: fonts.extraBold, color: '#FFD966', marginBottom: 3 },
  timerSub: { fontSize: 11, fontFamily: fonts.semiBold, color: '#888', lineHeight: 16 },
  timerBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  timerCount: { fontSize: 22, fontFamily: fonts.black, color: '#fff', lineHeight: 26 },
  timerBtnLabel: { fontSize: 9, fontFamily: fonts.extraBold, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },

  // Shaken note
  shakenNote: { backgroundColor: '#F0F7FF', borderRadius: radius.md, padding: spacing.md, borderLeftWidth: 3, borderLeftColor: '#1565C0' },
  shakenNoteText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#1565C0', lineHeight: 19 },

  stepCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, flexDirection: 'row', gap: 14, alignItems: 'flex-start', borderWidth: 2, borderColor: '#F5F5F5' },
  stepNum: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F0F0EC', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText: { fontSize: 13, fontFamily: fonts.black, color: colors.textMuted },
  stepTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },
  stepDesc:  { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 4, lineHeight: 18 },

  doneCard: { backgroundColor: '#1C1A14', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: 6 },
  fezBtn: { backgroundColor: '#1C1A14', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(255,210,80,0.2)' },
  fezBtnTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: '#FFD966', marginTop: 4 },
  fezBtnSub: { fontSize: 12, fontFamily: fonts.semiBold, color: '#888' },
  doneTitle: { fontSize: 16, fontFamily: fonts.extraBold, color: '#FFD966', marginTop: 4 },
  doneSub:   { fontSize: 12, fontFamily: fonts.semiBold, color: '#888' },

  historyCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 2, borderColor: '#F5F5F5' },
  historyText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#444', lineHeight: 22 },
  quoteCard:   { backgroundColor: '#1C1A14', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,210,80,0.1)' },
  quoteLabel:  { fontSize: 11, fontFamily: fonts.extraBold, color: '#B8860B', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 },
  quoteName:   { fontSize: 18, fontFamily: fonts.extraBold, color: '#FFD966' },
  quoteText:   { fontSize: 13, fontFamily: fonts.semiBold, color: '#888', marginTop: 8, lineHeight: 20, fontStyle: 'italic' },
  originCard:  { borderRadius: radius.xl, padding: spacing.lg, borderWidth: 2 },
});
