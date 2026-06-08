import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, spacing } from '../theme';
import drinks from '../data/drinks';
import ingredientCategories from '../data/ingredients';

const ACCENT = '#9B6FD4';
const BASES_ADMIN   = ['Rum', 'Gin', 'Vodka', 'Tequila', 'Cachaça', 'Whisky', 'Bourbon', 'Aperol', 'Campari', 'Sem álcool', 'Outro'];
const DIFFS         = ['Fácil', 'Médio', 'Difícil', 'Expert'];
const DRINK_COLORS  = ['#C84B31','#E64A19','#F9A825','#2E7D32','#1565C0','#00838F','#7B1FA2','#9B6FD4','#BF360C','#37474F','#1A1A1A'];

function parseIngredients(text) {
  return text.split('\n')
    .map(l => l.trim()).filter(Boolean)
    .map(l => {
      const idx = l.indexOf(' - ');
      if (idx > -1) return { name: l.slice(0, idx).trim(), amount: l.slice(idx + 3).trim() };
      return { name: l, amount: '' };
    });
}
function parseTags(text) {
  return text.split(',').map(t => t.trim()).filter(Boolean);
}

const allIngredients = ingredientCategories.flatMap(c => c.items);
function ingredientName(id) {
  return allIngredients.find(i => i.id === id)?.label ?? id;
}

function timeAgo(dateStr) {
  if (!dateStr) return '–';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(min / 60);
  const d    = Math.floor(h / 24);
  if (min < 2)   return 'agora';
  if (min < 60)  return `${min}m atrás`;
  if (h < 24)    return `${h}h atrás`;
  if (d === 1)   return 'ontem';
  if (d < 7)     return `${d}d atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function userHandle(email = '') {
  return email.split('@')[0];
}

export default function AdminScreen({ navigation }) {
  const [stats, setStats]               = useState(null);
  const [userList, setUserList]         = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [suggestions, setSuggestions]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [topTab, setTopTab]             = useState('makes');
  const [showUsers, setShowUsers]       = useState(false);

  // ── ADD DRINK FORM ──
  const [showAddDrink, setShowAddDrink] = useState(false);
  const [formName, setFormName]         = useState('');
  const [formBase, setFormBase]         = useState('');
  const [formColor, setFormColor]       = useState('#1565C0');
  const [formDiff, setFormDiff]         = useState('Médio');
  const [formTime, setFormTime]         = useState('5 min');
  const [formDesc, setFormDesc]         = useState('');
  const [formIngs, setFormIngs]         = useState('');
  const [formTags, setFormTags]         = useState('');
  const [formPublished, setFormPublished] = useState(true);
  const [addingDrink, setAddingDrink]   = useState(false);
  const [addError, setAddError]         = useState('');
  const [addOk, setAddOk]              = useState(false);

  useEffect(() => {
    (async () => {
      const [statsRes, usersRes, activityRes, suggestRes] = await Promise.all([
        supabase.rpc('get_admin_stats'),
        supabase.rpc('get_user_list'),
        supabase.rpc('get_recent_activity', { limit_n: 30 }),
        supabase.from('drink_suggestions').select('*').order('created_at', { ascending: false }),
      ]);
      if (statsRes.error) { setError(statsRes.error.message); setLoading(false); return; }
      setStats(statsRes.data);
      setUserList(usersRes.data || []);
      setRecentActivity(activityRes.data || []);
      setSuggestions(suggestRes.data || []);
      setLoading(false);
    })();
  }, []);

  const handleAddDrink = async () => {
    if (!formName.trim()) { setAddError('Nome obrigatório.'); return; }
    setAddError('');
    setAddingDrink(true);
    const { error: err } = await supabase.from('drinks_extra').insert({
      name: formName.trim(),
      base: formBase || null,
      color: formColor,
      difficulty: formDiff,
      time: formTime.trim() || '5 min',
      description: formDesc.trim(),
      ingredients: parseIngredients(formIngs),
      tags: parseTags(formTags),
      published: formPublished,
    });
    setAddingDrink(false);
    if (err) { setAddError('Erro: ' + err.message); return; }
    setFormName(''); setFormBase(''); setFormColor('#1565C0'); setFormDiff('Médio');
    setFormTime('5 min'); setFormDesc(''); setFormIngs(''); setFormTags('');
    setFormPublished(true);
    setAddOk(true);
    setTimeout(() => setAddOk(false), 3000);
    setShowAddDrink(false);
  };

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
  const topList = (stats?.[topDrinkKey] || []).map(d => ({
    ...d,
    name: drinks.find(dr => dr.id === d.drink_id)?.name ?? `Drink #${d.drink_id}`,
  }));
  const maxTopVal = Math.max(...topList.map(d => d.count), 1);

  const dailyActivity = stats?.daily_activity || [];
  const maxDaily = Math.max(...dailyActivity.map(d => d.count), 1);

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
          {[
            { label: 'Usuários',  value: stats?.total_users     ?? '–', emoji: '👤', onPress: () => setShowUsers(v => !v), active: showUsers },
            { label: 'Preparo',   value: stats?.total_makes     ?? '–', emoji: '🥃' },
            { label: 'Favoritos', value: stats?.total_favorites ?? '–', emoji: '❤️' },
            { label: 'Visitas',   value: stats?.total_views     ?? '–', emoji: '👁️' },
          ].map(({ label, value, emoji, onPress, active }) => (
            <TouchableOpacity
              key={label}
              onPress={onPress}
              activeOpacity={onPress ? 0.75 : 1}
              style={[styles.summaryCard, active && styles.summaryCardActive]}
            >
              <Text style={styles.summaryEmoji}>{emoji}</Text>
              <Text style={styles.summaryValue}>{value}</Text>
              <Text style={styles.summaryLabel}>{label}</Text>
              {onPress && (
                <Text style={[styles.summaryChevron, active && { color: ACCENT }]}>
                  {active ? '▲' : '▼'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* LISTA DE USUÁRIOS — expansível */}
        {showUsers && (
          <View style={[styles.section, { marginTop: spacing.xl }]}>
            <Text style={styles.sectionTitle}>👤 Usuários cadastrados</Text>
            {userList.length === 0 ? (
              <Text style={styles.emptyText}>Sem dados ainda</Text>
            ) : (
              userList.map((u, i) => (
                <View key={u.user_id ?? i} style={styles.userRow}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{userHandle(u.email)[0]?.toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                    <View style={styles.userMeta}>
                      <Text style={styles.userMetaText}>🥃 {u.total_makes ?? 0}</Text>
                      <Text style={styles.userMetaText}>❤️ {u.total_favorites ?? 0}</Text>
                      {u.last_make && (
                        <Text style={styles.userMetaText}>⏱ {timeAgo(u.last_make)}</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.userJoined}>{timeAgo(u.joined_at)}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* DAILY ACTIVITY CHART */}
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
              { id: 'makes',     label: 'Feitos'    },
              { id: 'favorites', label: 'Favoritos' },
              { id: 'views',     label: 'Vistos'    },
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

        {/* ATIVIDADE RECENTE — quem fez qual drink */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Atividade recente</Text>
          {recentActivity.length === 0 ? (
            <Text style={styles.emptyText}>Sem atividade ainda</Text>
          ) : (
            recentActivity.map((a, i) => {
              const drinkName = drinks.find(d => d.id === a.drink_id)?.name ?? `Drink #${a.drink_id}`;
              return (
                <View key={i} style={styles.activityRow}>
                  <Text style={styles.activityIcon}>🥃</Text>
                  <Text style={styles.activityText} numberOfLines={1}>
                    <Text style={styles.activityUser}>{userHandle(a.email)}</Text>
                    {' fez '}<Text style={{ color: '#ccc' }}>{drinkName}</Text>
                  </Text>
                  <Text style={styles.activityTime}>{timeAgo(a.made_at)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* TOP INGREDIENTS */}
        {stats?.top_ingredients?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredientes mais usados</Text>
            {stats.top_ingredients.map((ing, i) => (
              <View key={ing.ingredient_id ?? i} style={styles.rankRow}>
                <Text style={styles.rankNum}>{i + 1}</Text>
                <Text style={[styles.rankName, { flex: 1 }]}>{ingredientName(ing.ingredient_id)}</Text>
                <Text style={styles.rankCount}>{ing.count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ADICIONAR DRINK */}
        <View style={styles.section}>
          <TouchableOpacity
            onPress={() => { setShowAddDrink(v => !v); setAddError(''); setAddOk(false); }}
            style={styles.addDrinkToggle}
          >
            <Text style={styles.sectionTitle}>➕ Adicionar drink ao catálogo</Text>
            <Text style={{ color: ACCENT, fontSize: 16 }}>{showAddDrink ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {addOk && (
            <View style={styles.addSuccessBox}>
              <Text style={styles.addSuccessText}>✓ Drink adicionado com sucesso!</Text>
            </View>
          )}

          {showAddDrink && (
            <View style={{ gap: 14, marginTop: 4 }}>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Nome *</Text>
                <TextInput value={formName} onChangeText={setFormName} placeholder="Ex: Mojito, Negroni..." placeholderTextColor="#444" style={styles.formInput} maxLength={80} />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Base</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {BASES_ADMIN.map(b => (
                      <TouchableOpacity key={b} onPress={() => setFormBase(formBase === b ? '' : b)}
                        style={[styles.chip, formBase === b && styles.chipActive]}>
                        <Text style={[styles.chipText, formBase === b && { color: '#fff' }]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Cor do card</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {DRINK_COLORS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setFormColor(c)}
                      style={[styles.colorDot, { backgroundColor: c }, formColor === c && styles.colorDotActive]} />
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Dificuldade</Text>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                  {DIFFS.map(d => (
                    <TouchableOpacity key={d} onPress={() => setFormDiff(d)}
                      style={[styles.chip, formDiff === d && styles.chipActive]}>
                      <Text style={[styles.chipText, formDiff === d && { color: '#fff' }]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Tempo (ex: 5 min)</Text>
                <TextInput value={formTime} onChangeText={setFormTime} placeholder="5 min" placeholderTextColor="#444" style={styles.formInput} maxLength={20} />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Descrição</Text>
                <TextInput value={formDesc} onChangeText={setFormDesc} placeholder="Breve descrição do drink..." placeholderTextColor="#444" style={[styles.formInput, styles.formTextarea]} multiline numberOfLines={3} textAlignVertical="top" maxLength={300} />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Ingredientes (um por linha: "Nome - Quantidade")</Text>
                <TextInput value={formIngs} onChangeText={setFormIngs}
                  placeholder={'Rum - 50ml\nSuco de limão - 30ml\nHortelã - 8 folhas'}
                  placeholderTextColor="#444" style={[styles.formInput, styles.formTextarea]}
                  multiline numberOfLines={5} textAlignVertical="top" maxLength={500} />
              </View>

              <View style={styles.formField}>
                <Text style={styles.formLabel}>Tags (separadas por vírgula)</Text>
                <TextInput value={formTags} onChangeText={setFormTags} placeholder="refrescante, cítrico, clássico" placeholderTextColor="#444" style={styles.formInput} maxLength={200} />
              </View>

              <TouchableOpacity
                onPress={() => setFormPublished(v => !v)}
                style={styles.toggleRow}
              >
                <View style={[styles.toggleDot, { backgroundColor: formPublished ? '#4CAF50' : '#555' }]} />
                <Text style={styles.toggleLabel}>{formPublished ? 'Publicar imediatamente' : 'Salvar como rascunho'}</Text>
              </TouchableOpacity>

              {addError ? <Text style={styles.addError}>{addError}</Text> : null}

              <TouchableOpacity onPress={handleAddDrink} disabled={addingDrink} style={styles.addDrinkBtn}>
                {addingDrink
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.addDrinkBtnText}>Salvar drink</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* SUGESTÕES DE DRINKS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🍹 Sugestões de drinks</Text>
          {suggestions.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma sugestão ainda.</Text>
          ) : suggestions.map(s => (
            <View key={s.id} style={styles.suggestionCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionName}>{s.drink_name}</Text>
                {s.base ? <Text style={styles.suggestionMeta}>Base: {s.base}</Text> : null}
                {s.notes ? <Text style={styles.suggestionNotes}>{s.notes}</Text> : null}
                <Text style={styles.suggestionDate}>{timeAgo(s.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge,
                s.status === 'approved' ? { backgroundColor: '#1A3A1A' } :
                s.status === 'rejected' ? { backgroundColor: '#3A1A1A' } :
                { backgroundColor: '#2A2A10' }
              ]}>
                <Text style={[styles.statusText,
                  s.status === 'approved' ? { color: '#4CAF50' } :
                  s.status === 'rejected' ? { color: '#FF5A5A' } :
                  { color: '#FFD966' }
                ]}>
                  {s.status === 'approved' ? '✓ ok' : s.status === 'rejected' ? '✗ não' : '⏳'}
                </Text>
              </View>
            </View>
          ))}
        </View>

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
  summaryCardActive: { borderColor: ACCENT, backgroundColor: '#1E1530' },
  summaryEmoji: { fontSize: 24 },
  summaryValue: { fontSize: 26, fontFamily: fonts.black, color: '#fff', marginTop: 4 },
  summaryLabel: { fontSize: 10, fontFamily: fonts.extraBold, color: '#888', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.8 },
  summaryChevron: { fontSize: 9, color: '#555', marginTop: 4 },

  section: { marginHorizontal: spacing.xl, marginTop: spacing.lg, backgroundColor: '#1A1A1A', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: '#2A2A2A' },
  sectionTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: '#fff', marginBottom: 14 },
  emptyText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#555', textAlign: 'center', paddingVertical: 16 },

  barChart: { flexDirection: 'row', alignItems: 'flex-end', height: 64, gap: 2 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: { width: '100%', borderRadius: 2 },

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

  // Usuários
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  userAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: ACCENT + '33', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarText: { fontSize: 15, fontFamily: fonts.extraBold, color: ACCENT },
  userEmail: { fontSize: 13, fontFamily: fonts.bold, color: '#ddd' },
  userMeta: { flexDirection: 'row', gap: 10, marginTop: 3 },
  userMetaText: { fontSize: 11, fontFamily: fonts.semiBold, color: '#666' },
  userJoined: { fontSize: 11, fontFamily: fonts.semiBold, color: '#555', flexShrink: 0 },

  // Atividade recente
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  activityIcon: { fontSize: 16, flexShrink: 0 },
  activityText: { flex: 1, fontSize: 13, fontFamily: fonts.semiBold, color: '#888' },
  activityUser: { fontFamily: fonts.extraBold, color: ACCENT },
  activityTime: { fontSize: 11, fontFamily: fonts.semiBold, color: '#555', flexShrink: 0 },

  // Add drink form
  addDrinkToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addSuccessBox: { backgroundColor: '#1A3A1A', borderRadius: 8, padding: 10, marginBottom: 8 },
  addSuccessText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#4CAF50' },
  formField: { gap: 6 },
  formLabel: { fontSize: 11, fontFamily: fonts.extraBold, color: '#888', letterSpacing: 0.8, textTransform: 'uppercase' },
  formInput: {
    backgroundColor: '#111', borderRadius: 10, borderWidth: 1.5, borderColor: '#2A2A2A',
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, fontFamily: fonts.semiBold, color: '#ddd',
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },
  formTextarea: { height: 100, paddingTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, borderWidth: 1.5, borderColor: '#333', backgroundColor: '#111' },
  chipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  chipText: { fontSize: 12, fontFamily: fonts.extraBold, color: '#888' },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotActive: { borderWidth: 3, borderColor: '#fff' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  toggleDot: { width: 20, height: 20, borderRadius: 10 },
  toggleLabel: { fontSize: 13, fontFamily: fonts.semiBold, color: '#ccc' },
  addError: { fontSize: 13, fontFamily: fonts.semiBold, color: '#FF5A5A' },
  addDrinkBtn: {
    backgroundColor: ACCENT, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center',
  },
  addDrinkBtnText: { fontSize: 15, fontFamily: fonts.extraBold, color: '#fff' },

  emptyText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#555' },
  suggestionCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' },
  suggestionName: { fontSize: 14, fontFamily: fonts.extraBold, color: '#fff' },
  suggestionMeta: { fontSize: 11, fontFamily: fonts.semiBold, color: ACCENT, marginTop: 2 },
  suggestionNotes: { fontSize: 12, fontFamily: fonts.semiBold, color: '#888', marginTop: 4, lineHeight: 17 },
  suggestionDate: { fontSize: 10, fontFamily: fonts.semiBold, color: '#555', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: fonts.extraBold },
});
