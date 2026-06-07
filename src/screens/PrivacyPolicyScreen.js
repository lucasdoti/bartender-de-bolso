import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '../theme';

const SECTIONS = [
  {
    title: '1. Quem somos',
    text: 'O Bartender de Bolso é um aplicativo desenvolvido por Lucas Doti para ajudar usuários a descobrir e preparar drinks em casa. Nossos dados de contato: contato@bartenderdebolso.com',
  },
  {
    title: '2. Dados coletados',
    text: 'Coletamos os seguintes dados pessoais:\n• E-mail e senha (para criação de conta)\n• Nome de exibição (opcional)\n• Lista de ingredientes cadastrados no "Meu Bar"\n• Histórico de drinks preparados\n• Drinks favoritos\n• Histórico de visualizações de drinks',
  },
  {
    title: '3. Finalidade do uso',
    text: 'Seus dados são usados exclusivamente para:\n• Personalizar sua experiência no app\n• Sugerir drinks com base nos seus ingredientes\n• Exibir suas estatísticas de uso\n• Manter sua sessão ativa entre os acessos',
  },
  {
    title: '4. Armazenamento e segurança',
    text: 'Seus dados são armazenados de forma segura no Supabase (plataforma americana com servidores certificados). Utilizamos autenticação por e-mail e senha com criptografia. Não compartilhamos seus dados com terceiros.',
  },
  {
    title: '5. Seus direitos (LGPD)',
    text: 'Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:\n• Acessar seus dados pessoais\n• Corrigir dados incorretos\n• Solicitar a exclusão dos seus dados\n• Revogar seu consentimento a qualquer momento\n\nPara exercer esses direitos, entre em contato: contato@bartenderdebolso.com',
  },
  {
    title: '6. Menores de idade',
    text: 'Este aplicativo é destinado exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados de menores de idade.',
  },
  {
    title: '7. Alterações nesta política',
    text: 'Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas dentro do próprio aplicativo.',
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Política de Privacidade</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Última atualização: junho de 2025</Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionText}>{s.text}</Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dúvidas? Fale conosco em{'\n'}contato@bartenderdebolso.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: colors.text, lineHeight: 24 },
  navTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 60, gap: 16 },
  updated: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.textLight, marginBottom: 4 },
  section: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.lg, borderWidth: 2, borderColor: '#F5F5F5', gap: 8,
  },
  sectionTitle: { fontSize: 13, fontFamily: fonts.extraBold, color: colors.text },
  sectionText: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, lineHeight: 21 },
  footer: {
    backgroundColor: colors.surfaceAlt, borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center',
  },
  footerText: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
