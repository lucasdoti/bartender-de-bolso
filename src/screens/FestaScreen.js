import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { fonts, radius, spacing } from '../theme';
import drinks from '../data/drinks';

const ACCENT = '#D4456F';
const MEDALS = ['🥇', '🥈', '🥉'];
const STORAGE_KEY = 'festa_session';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}m atrás`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

// phase: 'idle' | 'loading' | 'creating' | 'joining' | 'active' | 'picking'
export default function FestaScreen({ navigation }) {
  const [phase, setPhase]             = useState('loading');
  const [partyCode, setPartyCode]     = useState('');
  const [partyId, setPartyId]         = useState(null);
  const [partyName, setPartyName]     = useState('');
  const [displayName, setDisplayName] = useState('');
  const [codeInput, setCodeInput]     = useState('');
  const [members, setMembers]         = useState([]);
  const [drinkLogs, setDrinkLogs]     = useState([]);
  const [loading, setLoading]         = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [drinkSearch, setDrinkSearch] = useState('');
  const [confirmLeave, setConfirmLeave] = useState(false);
  const channelRef = useRef(null);

  // Restaurar sessão ao abrir
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw);
          setPartyId(session.partyId);
          setPartyCode(session.partyCode);
          setPartyName(session.partyName);
          setDisplayName(session.displayName);
          await loadPartyData(session.partyId);
          subscribeToParty(session.partyId);
          setPhase('active');
          return;
        }
      } catch (_) {}
      setPhase('idle');
    })();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const saveSession = (data) =>
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});

  const clearSession = () =>
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});

  const loadPartyData = async (pid) => {
    const [membersRes, logsRes] = await Promise.all([
      supabase.from('party_members').select('*').eq('party_id', pid).order('joined_at'),
      supabase.from('party_drinks').select('*').eq('party_id', pid).order('logged_at', { ascending: false }),
    ]);
    if (membersRes.data) setMembers(membersRes.data);
    if (logsRes.data)    setDrinkLogs(logsRes.data);
  };

  const subscribeToParty = (pid) => {
    try {
      const ch = supabase
        .channel(`party:${pid}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'party_drinks',  filter: `party_id=eq.${pid}` }, () => loadPartyData(pid))
        .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `party_id=eq.${pid}` }, () => loadPartyData(pid))
        .subscribe();
      channelRef.current = ch;
    } catch (_) {}
  };

  const createParty = async () => {
    if (!partyName.trim() || !displayName.trim()) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error('Você precisa estar logado para criar uma festa.');
      const user = authData.user;
      const code = generateCode();

      const { data: party, error: partyErr } = await supabase
        .from('parties')
        .insert({ name: partyName.trim(), code, created_by: user.id })
        .select()
        .single();
      if (partyErr) throw new Error(partyErr.message);

      const { error: memberErr } = await supabase
        .from('party_members')
        .insert({ party_id: party.id, user_id: user.id, display_name: displayName.trim() });
      if (memberErr) throw new Error(memberErr.message);

      setPartyId(party.id);
      setPartyCode(code);
      await loadPartyData(party.id);
      subscribeToParty(party.id);
      saveSession({ partyId: party.id, partyCode: code, partyName: partyName.trim(), displayName: displayName.trim() });
      setPhase('active');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
    } catch (e) {
      setErrorMsg(e.message || 'Erro desconhecido. Tente novamente.');
    }
    setLoading(false);
  };

  const joinParty = async () => {
    if (!codeInput.trim() || !displayName.trim()) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) throw new Error('Você precisa estar logado para entrar em uma festa.');
      const user = authData.user;
      const code = codeInput.trim().toUpperCase();

      const { data: party, error: partyErr } = await supabase
        .from('parties').select().eq('code', code).single();
      if (partyErr || !party) throw new Error('Festa não encontrada. Verifique o código.');

      const { data: existing } = await supabase
        .from('party_members').select().eq('party_id', party.id).eq('user_id', user.id).maybeSingle();

      if (!existing) {
        const { error: memberErr } = await supabase
          .from('party_members')
          .insert({ party_id: party.id, user_id: user.id, display_name: displayName.trim() });
        if (memberErr) throw new Error(memberErr.message);
      }

      setPartyId(party.id);
      setPartyCode(party.code);
      setPartyName(party.name);
      await loadPartyData(party.id);
      subscribeToParty(party.id);
      saveSession({ partyId: party.id, partyCode: party.code, partyName: party.name, displayName: displayName.trim() });
      setPhase('active');
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
    } catch (e) {
      setErrorMsg(e.message || 'Erro desconhecido. Tente novamente.');
    }
    setLoading(false);
  };

  const doLeave = () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    clearSession();
    setPhase('idle');
    setPartyId(null);
    setPartyCode('');
    setPartyName('');
    setDisplayName('');
    setCodeInput('');
    setMembers([]);
    setDrinkLogs([]);
    setConfirmLeave(false);
    setErrorMsg('');
  };

  const logDrink = async (drinkId, customName = null) => {
    setDrinkSearch('');
    setPhase('active');
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;
    const payload = { party_id: partyId, user_id: authData.user.id };
    if (customName) payload.custom_name = customName;
    else payload.drink_id = drinkId;
    await supabase.from('party_drinks').insert(payload);
    await loadPartyData(partyId);
  };

  // ─── LOADING ─────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={ACCENT} />
        </View>
      </SafeAreaView>
    );
  }

  // ─── IDLE ────────────────────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.navBack}>
          <Text style={styles.navBackText}>‹ Voltar</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.idleContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.idleEmoji}>🎉</Text>
          <Text style={styles.idleTitle}>Modo Festa</Text>
          <Text style={styles.idleSub}>
            Crie ou entre em uma festa e veja quem bebe mais — com ranking ao vivo!
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => { setErrorMsg(''); setPhase('creating'); }} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>🥳  Criar festa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setErrorMsg(''); setPhase('joining'); }} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>🔑  Entrar com código</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── FORM ────────────────────────────────────────────────────────────────────
  if (phase === 'creating' || phase === 'joining') {
    const isCreating = phase === 'creating';
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => { setErrorMsg(''); setPhase('idle'); }} style={styles.backRow}>
              <Text style={styles.backRowText}>‹ Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>
              {isCreating ? '🥳 Nova festa' : '🔑 Entrar na festa'}
            </Text>

            {isCreating ? (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Nome da festa</Text>
                <TextInput
                  value={partyName}
                  onChangeText={setPartyName}
                  placeholder="Ex: Casamento da Ana 🎊"
                  placeholderTextColor="#444"
                  style={styles.fieldInput}
                />
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Código da festa</Text>
                <TextInput
                  value={codeInput}
                  onChangeText={setCodeInput}
                  placeholder="Ex: AB12CD"
                  placeholderTextColor="#444"
                  style={[styles.fieldInput, styles.codeInputStyle]}
                  autoCapitalize="characters"
                  maxLength={6}
                />
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Seu nome no ranking</Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Como quer aparecer?"
                placeholderTextColor="#444"
                style={styles.fieldInput}
              />
            </View>

            {errorMsg ? <Text style={styles.errorMsg}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
              onPress={isCreating ? createParty : joinParty}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>{isCreating ? 'Criar festa  🎉' : 'Entrar na festa  🚀'}</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ─── DRINK PICKER ────────────────────────────────────────────────────────────
  if (phase === 'picking') {
    const filtered = drinks.filter(d =>
      d.name.toLowerCase().includes(drinkSearch.toLowerCase()) ||
      d.base.toLowerCase().includes(drinkSearch.toLowerCase())
    );
    const showCustom = drinkSearch.trim().length >= 2;
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.pickerHeader}>
          <TouchableOpacity onPress={() => { setDrinkSearch(''); setPhase('active'); }}>
            <Text style={styles.navBackText}>‹ Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Qual drink você tomou?</Text>
        </View>
        <View style={styles.pickerSearchRow}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={drinkSearch}
            onChangeText={setDrinkSearch}
            placeholder="Buscar ou digitar nome do drink..."
            placeholderTextColor="#444"
            style={styles.pickerSearchInput}
            autoFocus
          />
        </View>

        {/* Opção de drink customizado */}
        {showCustom && (
          <TouchableOpacity
            style={styles.customDrinkBtn}
            onPress={() => logDrink(null, drinkSearch.trim())}
            activeOpacity={0.8}
          >
            <Text style={styles.customDrinkText}>
              ＋ Adicionar "<Text style={{ color: '#fff' }}>{drinkSearch.trim()}</Text>"
            </Text>
            <Text style={styles.customDrinkSub}>Não está no cardápio</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={filtered}
          keyExtractor={d => String(d.id)}
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.drinkItem} onPress={() => logDrink(item.id)} activeOpacity={0.75}>
              <View style={{ flex: 1 }}>
                <Text style={styles.drinkItemName}>{item.name}</Text>
                <Text style={styles.drinkItemSub}>{item.base} · {item.abv}</Text>
              </View>
              <Text style={{ fontSize: 18, color: ACCENT }}>＋</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#1E1E1E' }} />}
        />
      </SafeAreaView>
    );
  }

  // ─── ACTIVE ──────────────────────────────────────────────────────────────────
  const getMemberName = (uid) => members.find(m => m.user_id === uid)?.display_name ?? '?';

  const leaderboard = Object.entries(
    drinkLogs.reduce((acc, log) => {
      acc[log.user_id] = (acc[log.user_id] || 0) + 1;
      return acc;
    }, {})
  ).map(([uid, count]) => ({ userId: uid, name: getMemberName(uid), count }))
   .sort((a, b) => b.count - a.count);

  const maxCount = leaderboard.length > 0 ? Math.max(...leaderboard.map(l => l.count)) : 1;

  const topDrinkEntry = Object.entries(
    drinkLogs.reduce((acc, log) => {
      const key = log.custom_name || drinks.find(d => d.id === log.drink_id)?.name || `#${log.drink_id}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).sort(([, a], [, b]) => b - a)[0];
  const topDrinkName = topDrinkEntry ? topDrinkEntry[0] : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <View style={styles.partyHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Text style={styles.headerBackText}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.partyLabel}>🎉 MODO FESTA</Text>
            <Text style={styles.partyTitle} numberOfLines={1}>{partyName || 'Festa'}</Text>
          </View>
          <View style={styles.codeBox}>
            <Text style={styles.codeBoxLabel}>Código</Text>
            <Text style={styles.codeBoxValue}>{partyCode}</Text>
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{drinkLogs.length}</Text>
            <Text style={styles.statLabel}>Drinks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{members.length}</Text>
            <Text style={styles.statLabel}>Pessoas</Text>
          </View>
          <View style={[styles.statCard, { flex: 2 }]}>
            <Text style={styles.statValue} numberOfLines={1}>{topDrinkName ?? '–'}</Text>
            <Text style={styles.statLabel}>Mais pedido</Text>
          </View>
        </View>

        {/* REGISTRAR DRINK — botão inline */}
        <TouchableOpacity style={styles.registerBtn} onPress={() => setPhase('picking')} activeOpacity={0.85}>
          <Text style={styles.registerBtnText}>＋  Registrar drink</Text>
        </TouchableOpacity>

        {/* LEADERBOARD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Ranking</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>Ninguém bebeu ainda — seja o primeiro! 🍹</Text>
          ) : (
            leaderboard.map((entry, i) => (
              <View key={entry.userId} style={styles.rankRow}>
                <Text style={styles.rankMedal}>{MEDALS[i] ?? String(i + 1)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rankName}>{entry.name}</Text>
                  <View style={styles.rankBarBg}>
                    <View style={[styles.rankBarFill, { width: `${(entry.count / maxCount) * 100}%` }]} />
                  </View>
                </View>
                <Text style={styles.rankCount}>{entry.count} 🥃</Text>
              </View>
            ))
          )}
        </View>

        {/* ACTIVITY FEED */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🕐 Atividade</Text>
          {drinkLogs.length === 0 ? (
            <Text style={styles.emptyText}>Sem atividade ainda</Text>
          ) : (
            drinkLogs.slice(0, 20).map((log, i) => {
              const name = log.custom_name || drinks.find(d => d.id === log.drink_id)?.name || `Drink #${log.drink_id}`;
              return (
                <View key={log.id ?? i} style={styles.feedRow}>
                  <Text style={styles.feedEmoji}>🍹</Text>
                  <Text style={styles.feedText} numberOfLines={1}>
                    <Text style={styles.feedName}>{getMemberName(log.user_id)}</Text>
                    {' bebeu '}<Text style={{ color: '#ccc' }}>{name}</Text>
                  </Text>
                  <Text style={styles.feedTime}>{timeAgo(log.logged_at)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* SAIR */}
        {confirmLeave ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>Sair da festa? Você pode voltar com o código.</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmLeave(false)}>
                <Text style={styles.confirmCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmLeave} onPress={doLeave}>
                <Text style={styles.confirmLeaveText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.leaveBtn} onPress={() => setConfirmLeave(true)} activeOpacity={0.7}>
            <Text style={styles.leaveBtnText}>Sair da festa</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D0D0D' },
  navBack: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 4 },
  navBackText: { fontSize: 16, fontFamily: fonts.bold, color: '#888' },

  // ── Idle ──
  idleContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, paddingBottom: 60 },
  idleEmoji:   { fontSize: 72, marginBottom: 16 },
  idleTitle:   { fontSize: 30, fontFamily: fonts.displayBold, color: '#fff', marginBottom: 10 },
  idleSub:     { fontSize: 14, fontFamily: fonts.semiBold, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 40 },

  primaryBtn:     { backgroundColor: ACCENT, borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', width: '100%', marginBottom: 14 },
  primaryBtnText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#fff' },
  secondaryBtn:     { backgroundColor: '#1E1E1E', borderRadius: radius.lg, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: '#333' },
  secondaryBtnText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#ccc' },

  // ── Form ──
  formContent: { flexGrow: 1, padding: spacing.xl, paddingBottom: 60 },
  backRow:     { marginBottom: 24 },
  backRowText: { fontSize: 16, fontFamily: fonts.bold, color: '#888' },
  formTitle:   { fontSize: 26, fontFamily: fonts.displayBold, color: '#fff', marginBottom: 28 },
  field:       { marginBottom: 20 },
  fieldLabel:  { fontSize: 12, fontFamily: fonts.extraBold, color: '#888', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  fieldInput:  { backgroundColor: '#1A1A1A', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#2A2A2A', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
  codeInputStyle: { letterSpacing: 6, textTransform: 'uppercase', fontSize: 20, textAlign: 'center' },
  errorMsg:    { fontSize: 13, fontFamily: fonts.bold, color: '#FF5A5A', marginBottom: 16, textAlign: 'center' },

  // ── Picker ──
  pickerHeader:    { flexDirection: 'row', alignItems: 'center', gap: 16, padding: spacing.xl, paddingBottom: spacing.md },
  pickerTitle:     { fontSize: 16, fontFamily: fonts.extraBold, color: '#fff', flex: 1 },
  pickerSearchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: 12, backgroundColor: '#1A1A1A', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#2A2A2A', paddingHorizontal: 14 },
  pickerSearchInput: { flex: 1, paddingVertical: 12, fontSize: 14, fontFamily: fonts.bold, color: '#fff' },
  customDrinkBtn:  { marginHorizontal: spacing.xl, marginBottom: 8, backgroundColor: '#1E1530', borderRadius: radius.md, padding: 14, borderWidth: 1.5, borderColor: ACCENT + '66' },
  customDrinkText: { fontSize: 14, fontFamily: fonts.extraBold, color: ACCENT },
  customDrinkSub:  { fontSize: 11, fontFamily: fonts.semiBold, color: '#555', marginTop: 3 },
  drinkItem:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: 14 },
  drinkItemName:   { fontSize: 14, fontFamily: fonts.bold, color: '#ddd' },
  drinkItemSub:    { fontSize: 11, fontFamily: fonts.semiBold, color: '#555', marginTop: 2 },

  // ── Active header ──
  partyHeader: { flexDirection: 'row', alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md },
  headerBack:     { width: 34, height: 34, borderRadius: 10, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center' },
  headerBackText: { fontSize: 22, color: '#fff', lineHeight: 26 },
  partyLabel:  { fontSize: 11, fontFamily: fonts.extraBold, color: ACCENT, letterSpacing: 1.2, textTransform: 'uppercase' },
  partyTitle:  { fontSize: 24, fontFamily: fonts.displayBold, color: '#fff', marginTop: 2 },
  codeBox:     { backgroundColor: '#1E1E1E', borderRadius: radius.md, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#333' },
  codeBoxLabel: { fontSize: 9, fontFamily: fonts.extraBold, color: '#555', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  codeBoxValue: { fontSize: 18, fontFamily: fonts.black, color: ACCENT, letterSpacing: 3 },

  // ── Stats ──
  statsRow: { flexDirection: 'row', marginHorizontal: spacing.xl, gap: 10, marginBottom: spacing.md },
  statCard: { flex: 1, backgroundColor: '#1A1A1A', borderRadius: radius.md, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A' },
  statValue: { fontSize: 16, fontFamily: fonts.black, color: '#fff', marginBottom: 2 },
  statLabel: { fontSize: 10, fontFamily: fonts.semiBold, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 },

  // ── Register button ──
  registerBtn:     { marginHorizontal: spacing.xl, marginBottom: 14, backgroundColor: ACCENT, borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', shadowColor: ACCENT, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  registerBtnText: { fontSize: 15, fontFamily: fonts.extraBold, color: '#fff' },

  // ── Sections ──
  section:      { marginHorizontal: spacing.xl, marginBottom: 14, backgroundColor: '#1A1A1A', borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: '#2A2A2A' },
  sectionTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: '#fff', marginBottom: 14 },
  emptyText:    { fontSize: 13, fontFamily: fonts.semiBold, color: '#555', textAlign: 'center', paddingVertical: 12 },

  // ── Leaderboard ──
  rankRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  rankMedal:  { fontSize: 20, width: 28, textAlign: 'center' },
  rankName:   { fontSize: 13, fontFamily: fonts.bold, color: '#ddd', marginBottom: 5 },
  rankBarBg:  { height: 4, backgroundColor: '#2A2A2A', borderRadius: 2, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  rankCount:  { fontSize: 13, fontFamily: fonts.extraBold, color: '#fff', minWidth: 40, textAlign: 'right' },

  // ── Feed ──
  feedRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  feedEmoji: { fontSize: 16, flexShrink: 0 },
  feedText:  { flex: 1, fontSize: 13, fontFamily: fonts.semiBold, color: '#888' },
  feedName:  { fontFamily: fonts.extraBold, color: ACCENT },
  feedTime:  { fontSize: 11, fontFamily: fonts.semiBold, color: '#444', flexShrink: 0 },

  // ── Leave ──
  leaveBtn:     { marginHorizontal: spacing.xl, marginTop: 8, paddingVertical: 14, borderRadius: radius.md, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', alignItems: 'center' },
  leaveBtnText: { fontSize: 13, fontFamily: fonts.extraBold, color: '#555' },
  confirmBox:   { marginHorizontal: spacing.xl, marginTop: 8, padding: spacing.lg, backgroundColor: '#1A1A1A', borderRadius: radius.lg, borderWidth: 1, borderColor: '#333' },
  confirmText:  { fontSize: 13, fontFamily: fonts.semiBold, color: '#ccc', textAlign: 'center' },
  confirmCancel:     { flex: 1, paddingVertical: 12, borderRadius: radius.md, backgroundColor: '#2A2A2A', alignItems: 'center' },
  confirmCancelText: { fontSize: 13, fontFamily: fonts.extraBold, color: '#888' },
  confirmLeave:      { flex: 1, paddingVertical: 12, borderRadius: radius.md, backgroundColor: '#3D1A1A', alignItems: 'center' },
  confirmLeaveText:  { fontSize: 13, fontFamily: fonts.extraBold, color: '#FF5A5A' },
});
