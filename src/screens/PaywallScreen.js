import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme';
import { getOfferings, purchasePackage, restorePurchases } from '../lib/purchases';

const FEATURES = [
  { icon: 'wine',         label: 'Meu Bar',           desc: 'Monte seu estoque e descubra o que pode fazer' },
  { icon: 'search',       label: 'Busca Rápida',       desc: 'Encontre drinks pelos ingredientes que você tem' },
  { icon: 'heart',        label: 'Favoritos',          desc: 'Salve seus drinks preferidos para acessar rápido' },
  { icon: 'sparkles',     label: 'Bartender IA',       desc: 'Receba sugestões personalizadas com inteligência artificial' },
  { icon: 'star',         label: 'Drink do Dia',       desc: 'Uma nova sugestão especial todo dia' },
  { icon: 'trophy',       label: 'Histórico & Streak', desc: 'Acompanhe sua jornada como bartender' },
];

export default function PaywallScreen({ navigation }) {
  const [offerings, setOfferings]         = useState(null);
  const [selectedPkg, setSelectedPkg]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [purchasing, setPurchasing]       = useState(false);
  const [restoring, setRestoring]         = useState(false);

  useEffect(() => {
    getOfferings().then(o => {
      setOfferings(o);
      if (o?.current?.availablePackages?.length) {
        const annual = o.current.availablePackages.find(p => p.packageType === 'ANNUAL' || p.identifier.includes('annual'));
        setSelectedPkg(annual || o.current.availablePackages[0]);
      }
      setLoading(false);
    });
  }, []);

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    setPurchasing(true);
    try {
      const isPremium = await purchasePackage(selectedPkg);
      if (isPremium) {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (_) {}
        navigation.goBack();
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Erro na compra', 'Não foi possível processar o pagamento. Tente novamente.');
      }
    }
    setPurchasing(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    const isPremium = await restorePurchases();
    setRestoring(false);
    if (isPremium) {
      Alert.alert('Compra restaurada!', 'Seu acesso premium foi restaurado.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert('Nenhuma compra encontrada', 'Não encontramos nenhuma assinatura ativa nessa conta.');
    }
  };

  const packages = offerings?.current?.availablePackages || [];

  const formatPrice = (pkg) => pkg?.product?.priceString || '—';
  const formatPeriod = (pkg) => {
    if (!pkg) return '';
    const type = pkg.packageType;
    if (type === 'MONTHLY') return '/mês';
    if (type === 'ANNUAL')  return '/ano';
    return '';
  };
  const perMonth = (pkg) => {
    if (!pkg || pkg.packageType !== 'ANNUAL') return null;
    const price = pkg?.product?.price;
    if (!price) return null;
    return `R$ ${(price / 12).toFixed(2).replace('.', ',')}/mês`;
  };
  const isAnnual = (pkg) => pkg?.packageType === 'ANNUAL' || pkg?.identifier?.includes('annual');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.title}>Bartender de Bolso</Text>
          <Text style={styles.subtitle}>Premium</Text>
          <Text style={styles.tagline}>Eleve sua experiência como bartender</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map(f => (
            <View key={f.icon} style={styles.featureRow}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={18} color="#9B6FD4" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureName}>{f.label}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            </View>
          ))}
        </View>

        {/* Plans */}
        <Text style={styles.plansTitle}>Escolha seu plano</Text>

        {loading ? (
          <ActivityIndicator color="#9B6FD4" style={{ marginVertical: 24 }} />
        ) : packages.length === 0 ? (
          <Text style={styles.notice}>Planos não disponíveis no momento.</Text>
        ) : (
          <View style={styles.plans}>
            {packages.map(pkg => {
              const annual    = isAnnual(pkg);
              const selected  = selectedPkg?.identifier === pkg.identifier;
              const monthly   = perMonth(pkg);
              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  onPress={() => setSelectedPkg(pkg)}
                  activeOpacity={0.8}
                  style={[styles.planCard, annual && styles.planCardHighlight, selected && styles.planCardSelected]}
                >
                  {annual && (
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>Melhor valor</Text>
                    </View>
                  )}
                  <Text style={[styles.planLabel, annual && styles.planLabelHighlight]}>
                    {annual ? 'Anual' : 'Mensal'}
                  </Text>
                  <Text style={[styles.planPrice, annual && styles.planPriceHighlight]}>
                    {formatPrice(pkg)}
                  </Text>
                  <Text style={[styles.planPeriod, annual && styles.planPeriodHighlight]}>
                    {formatPeriod(pkg)}
                  </Text>
                  {monthly && <Text style={styles.planPerMonth}>{monthly}</Text>}
                  {selected && <View style={styles.selectedDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, (!selectedPkg || purchasing) && { opacity: 0.6 }]}
          activeOpacity={0.85}
          onPress={handlePurchase}
          disabled={!selectedPkg || purchasing}
        >
          {purchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.ctaText}>
              {selectedPkg ? `Assinar por ${formatPrice(selectedPkg)}` : 'Assinar'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.notice}>
          Renovação automática. Cancele quando quiser pela loja.{'\n'}
          {Platform.OS === 'ios' ? 'Gerenciado pela App Store.' : 'Gerenciado pela Google Play.'}
        </Text>

        <TouchableOpacity onPress={handleRestore} disabled={restoring}>
          {restoring
            ? <ActivityIndicator color="rgba(255,255,255,0.35)" />
            : <Text style={styles.restore}>Restaurar compra</Text>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: '#0D0D14' },
  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-end', marginTop: spacing.md, padding: 8 },
  header: { alignItems: 'center', marginBottom: 28 },
  crown:    { fontSize: 44, marginBottom: 8 },
  title:    { fontFamily: fonts.bold,      fontSize: 20, color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontFamily: fonts.extraBold, fontSize: 28, color: '#9B6FD4', marginTop: 2 },
  tagline:  { fontFamily: fonts.regular,   fontSize: 14, color: 'rgba(255,255,255,0.55)', marginTop: 8, textAlign: 'center' },

  features:    { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.lg, padding: spacing.md, marginBottom: 28, gap: 14 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(155,111,212,0.15)', alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureName: { fontFamily: fonts.bold,    fontSize: 14, color: '#fff' },
  featureDesc: { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

  plansTitle: { fontFamily: fonts.bold, fontSize: 16, color: '#fff', marginBottom: 12, textAlign: 'center' },
  plans:      { flexDirection: 'row', gap: 12, marginBottom: 24 },
  planCard: {
    flex: 1, borderRadius: radius.lg, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16, alignItems: 'center', position: 'relative',
  },
  planCardHighlight: { borderColor: '#9B6FD4', backgroundColor: 'rgba(155,111,212,0.12)' },
  planCardSelected:  { borderWidth: 2.5 },
  planBadge:     { position: 'absolute', top: -11, backgroundColor: '#9B6FD4', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  planBadgeText: { fontFamily: fonts.extraBold, fontSize: 10, color: '#fff' },
  planLabel:          { fontFamily: fonts.bold,      fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8 },
  planLabelHighlight: { color: '#C4A3F0' },
  planPrice:          { fontFamily: fonts.extraBold, fontSize: 26, color: '#fff', marginTop: 6 },
  planPriceHighlight: { color: '#fff' },
  planPeriod:          { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  planPeriodHighlight: { color: 'rgba(196,163,240,0.7)' },
  planPerMonth:  { fontFamily: fonts.bold, fontSize: 11, color: '#9B6FD4', marginTop: 4 },
  selectedDot:   { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9B6FD4', marginTop: 8 },

  ctaBtn:  { backgroundColor: '#9B6FD4', borderRadius: radius.lg, paddingVertical: 16, alignItems: 'center', marginBottom: 14 },
  ctaText: { fontFamily: fonts.extraBold, fontSize: 16, color: '#fff', letterSpacing: 0.3 },

  notice:  { fontFamily: fonts.regular, fontSize: 12, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 18, marginBottom: 16 },
  restore: { fontFamily: fonts.bold, fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center', textDecorationLine: 'underline' },
});
