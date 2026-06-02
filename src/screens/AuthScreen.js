import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import AppIcon from '../components/AppIcon';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode]         = useState('login'); // login | signup
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'signup' && !name)) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) Alert.alert('Erro ao entrar', traduzErro(error.message));
    } else {
      const { error } = await signUp(email, password, name);
      if (error) {
        Alert.alert('Erro ao cadastrar', traduzErro(error.message));
      } else {
        Alert.alert('Tudo certo! 🥂', 'Conta criada! Verifique seu email para confirmar e depois faça login.');
        setMode('login');
      }
    }
    setLoading(false);
  };

  const traduzErro = (msg) => {
    if (msg.includes('Invalid login')) return 'Email ou senha incorretos.';
    if (msg.includes('already registered')) return 'Este email já está cadastrado.';
    if (msg.includes('Email not confirmed')) return 'Confirme seu email antes de entrar.';
    return msg;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* LOGO */}
          <View style={styles.logoWrapper}>
            <AppIcon size={72} />
            <Text style={styles.brandName}>Bartender de Bolso</Text>
            <Text style={styles.brandSub}>Seu bartender pessoal 🥃</Text>
          </View>

          {/* TÍTULO */}
          <Text style={styles.title}>
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Entre para acessar seus drinks e seu bar'
              : 'Cadastre-se e comece a preparar drinks'}
          </Text>

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
                  {mode === 'login' ? 'Entrar' : 'Criar conta'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* ALTERNAR MODO */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login' ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
            </Text>
            <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
              </Text>
            </TouchableOpacity>
          </View>

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
  subtitle: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted, marginTop: 6, marginBottom: spacing.xl },

  form: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 15, fontFamily: fonts.bold, color: colors.text },

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
});
