import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]         = useState('login'); // 'login' | 'signup' | 'forgot'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (showPolicy) {
    return <PrivacyPolicyScreen navigation={{ goBack: () => setShowPolicy(false) }} />;
  }

  const switchMode = (next) => {
    setErrorMsg('');
    setSuccessMsg('');
    setMode(next);
  };

  const traduzErro = (msg) => {
    if (msg.includes('Invalid login'))       return 'Email ou senha incorretos.';
    if (msg.includes('already registered'))  return 'Este email já está cadastrado.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.';
    return msg;
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'forgot') {
      if (!email.trim()) { setErrorMsg('Digite seu email.'); return; }
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      setLoading(false);
      if (error) {
        setErrorMsg('Erro ao enviar email. Verifique o endereço e tente novamente.');
      } else {
        setSuccessMsg('Link enviado! Verifique seu email para redefinir sua senha. 📧');
      }
      return;
    }

    if (!email || !password || (mode === 'signup' && !name)) {
      setErrorMsg('Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password);
      if (error) setErrorMsg(traduzErro(error.message));
    } else {
      const { error } = await signUp(email.trim(), password, name.trim());
      if (error) {
        setErrorMsg(traduzErro(error.message));
      } else {
        switchMode('login');
        setSuccessMsg('Conta criada! 🥂 Verifique seu email para confirmar e depois faça login.');
      }
    }
    setLoading(false);
  };

  const titles    = { login: 'Bem-vindo de volta!', signup: 'Crie sua conta',   forgot: 'Recuperar senha' };
  const subtitles = {
    login:  'Entre para acessar seus drinks e seu bar',
    signup: 'Cadastre-se e comece a preparar drinks',
    forgot: 'Enviaremos um link de redefinição para seu email',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* LOGO */}
          <View style={styles.logoWrapper}>
            <AppIcon size={72} />
            <Text style={styles.brandName}>Bartender de Bolso</Text>
            <Text style={styles.brandSub}>Seu bartender pessoal 🥃</Text>
          </View>

          {/* TÍTULO */}
          <Text style={styles.title}>{titles[mode]}</Text>
          <Text style={styles.subtitle}>{subtitles[mode]}</Text>

          {/* FEEDBACK MESSAGES */}
          {successMsg ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{successMsg}</Text>
            </View>
          ) : null}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* FORM */}
          <View style={styles.form}>
            {mode === 'signup' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textLight}
                  style={styles.input}
                />
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={colors.textLight}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            {mode !== 'forgot' && (
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Senha"
                  placeholderTextColor={colors.textLight}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            )}

            {/* ESQUECI MINHA SENHA — só no modo login */}
            {mode === 'login' && (
              <TouchableOpacity onPress={() => switchMode('forgot')} style={{ alignSelf: 'flex-end', marginTop: -4 }}>
                <Text style={styles.forgotLink}>Esqueci minha senha</Text>
              </TouchableOpacity>
            )}

            {/* BOTÃO PRINCIPAL */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={loading}
              style={styles.submitBtn}
            >
              {loading ? (
                <ActivityIndicator color="#FFD966" />
              ) : (
                <Text style={styles.submitText}>
                  {mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ALTERNAR MODO */}
          {mode !== 'forgot' ? (
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
              </Text>
              <TouchableOpacity onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                <Text style={styles.switchLink}>
                  {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.switchRow, { justifyContent: 'center' }]}>
              <TouchableOpacity onPress={() => switchMode('login')}>
                <Text style={styles.switchLink}>‹ Voltar ao login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* POLÍTICA DE PRIVACIDADE */}
          <Text style={styles.privacyNote}>
            Ao usar o app você concorda com a nossa{' '}
            <Text style={styles.privacyLink} onPress={() => setShowPolicy(true)}>
              Política de Privacidade
            </Text>
            . Conteúdo para maiores de 18 anos.
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },

  logoWrapper: { alignItems: 'center', marginBottom: spacing.xxl },
  brandName: { fontSize: 22, fontFamily: fonts.displayBold, color: colors.text, marginTop: 16 },
  brandSub: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 4 },

  title: { fontSize: 26, fontFamily: fonts.displayBold, color: colors.text },
  subtitle: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 6, marginBottom: spacing.lg },

  successBox: {
    backgroundColor: '#F0FFF4', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#6FCF97',
    padding: spacing.md, marginBottom: spacing.md,
  },
  successText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#1A6B3C', lineHeight: 19 },
  errorBox: {
    backgroundColor: '#FFF5F5', borderRadius: radius.md, borderWidth: 1.5, borderColor: '#FFAAAA',
    padding: spacing.md, marginBottom: spacing.md,
  },
  errorText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#C0392B' },

  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: {
    flex: 1, paddingVertical: 15, fontSize: 15, fontFamily: fonts.bold, color: colors.text,
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },

  forgotLink: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary, paddingVertical: 4 },

  submitBtn: {
    backgroundColor: colors.dark, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  submitText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#fff' },

  switchRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.xl },
  switchText: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted },
  switchLink: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.primary },

  privacyNote: { fontSize: 12, fontFamily: fonts.semiBold, color: colors.textLight, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  privacyLink: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.primary },
});
