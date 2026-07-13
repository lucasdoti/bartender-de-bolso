import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '../theme';

const FEATURES = [
  { icon: 'wine',         label: 'Meu Bar',          desc: 'Monte seu estoque e descubra o que pode fazer' },
  { icon: 'search',       label: 'Busca Rápida',      desc: 'Encontre drinks pelos ingredientes que você tem' },
  { icon: 'heart',        label: 'Favoritos',         desc: 'Salve seus drinks preferidos para acessar rápido' },
  { icon: 'sparkles',     label: 'Bartender IA',      desc: 'Receba sugestões personalizadas com inteligência artificial' },
  { icon: 'star',         label: 'Drink do Dia',      desc: 'Uma nova sugestão especial todo dia' },
  { icon: 'trophy',       label: 'Histórico & Streak', desc: 'Acompanhe sua jornada como bartender' },
];

const PLANS = [
  {
    id: 'monthly',
    label: 'Mensal',
    price: 'R$ 9,90',
    period: '/mês',
    highlight: false,
    badge: null,
  },
  {
    id: 'annual',
    label: 'Anual',
    price: 'R$ 49,90',
    period: '/ano',
    highlight: true,
    badge: 'Economize 58%',
    perMonth: 'R$ 4,16/mês',
  },
];

export default function PaywallScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={colors.textLight} />
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
        <View style={styles.plans}>
          {PLANS.map(plan => (
            <View key={plan.id} style={[styles.planCard, plan.highlight && styles.planCardHighlight]}>
              {plan.badge && (
                <View style={styles.planBadge}>
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}
              <Text style={[styles.planLabel, plan.highlight && styles.planLabelHighlight]}>
                {plan.label}
              </Text>
              <Text style={[styles.planPrice, plan.highlight && styles.planPriceHighlight]}>
                {plan.price}
              </Text>
              <Text style={[styles.planPeriod, plan.highlight && styles.planPeriodHighlight]}>
                {plan.period}
              </Text>
              {plan.perMonth && (
                <Text style={styles.planPerMonth}>{plan.perMonth}</Text>
              )}
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
        >
          <Text style={styles.ctaText}>Em breve no Google Play</Text>
        </TouchableOpacity>

        <Text style={styles.notice}>
          A assinatura estará disponível assim que o app for publicado na Play Store.
          Cancele quando quiser, sem burocracia.
        </Text>

        <Text style={styles.restore}>Restaurar compra</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0D0D14',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 40,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  crown: {
    fontSize: 44,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: '#fff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: '#9B6FD4',
    marginTop: 2,
  },
  tagline: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 8,
    textAlign: 'center',
  },
  features: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: 28,
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(155,111,212,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#fff',
  },
  featureDesc: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  plansTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  plans: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  planCardHighlight: {
    borderColor: '#9B6FD4',
    backgroundColor: 'rgba(155,111,212,0.12)',
  },
  planBadge: {
    position: 'absolute',
    top: -11,
    backgroundColor: '#9B6FD4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  planBadgeText: {
    fontFamily: fonts.extraBold,
    fontSize: 10,
    color: '#fff',
  },
  planLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
  },
  planLabelHighlight: {
    color: '#C4A3F0',
  },
  planPrice: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    color: '#fff',
    marginTop: 6,
  },
  planPriceHighlight: {
    color: '#fff',
  },
  planPeriod: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  planPeriodHighlight: {
    color: 'rgba(196,163,240,0.7)',
  },
  planPerMonth: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: '#9B6FD4',
    marginTop: 4,
  },
  ctaBtn: {
    backgroundColor: '#9B6FD4',
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  ctaText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.3,
  },
  notice: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  restore: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
