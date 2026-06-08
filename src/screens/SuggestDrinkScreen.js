import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors, fonts, radius, spacing } from '../theme';

const BASES = ['Rum', 'Gin', 'Vodka', 'Tequila', 'Cachaça', 'Whisky', 'Bourbon', 'Aperol', 'Campari', 'Outro'];

export default function SuggestDrinkScreen({ navigation }) {
  const { user } = useAuth();
  const [name,    setName]    = useState('');
  const [base,    setBase]    = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Digite o nome do drink.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await supabase.from('drink_suggestions').insert({
      user_id:    user.id,
      drink_name: name.trim(),
      base:       base.trim() || null,
      notes:      notes.trim() || null,
    });
    setLoading(false);
    if (err) {
      setError('Erro ao enviar. Tente novamente.');
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.doneWrapper}>
          <Text style={{ fontSize: 52 }}>🍹</Text>
          <Text style={styles.doneTitle}>Sugestão enviada!</Text>
          <Text style={styles.doneSub}>
            Obrigado pela ideia! Vamos analisar e quem sabe seu drink favorito
            aparece no app em breve. 🥂
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Text style={styles.headerBackIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sugerir um drink</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>
            Tem um drink favorito que não está no app? Nos conta! Analisamos todas
            as sugestões e adicionamos os melhores. 🍸
          </Text>

          {/* NOME */}
          <View style={styles.field}>
            <Text style={styles.label}>Nome do drink *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex: Aperol Spritz, Margarita..."
              placeholderTextColor={colors.textLight}
              style={styles.input}
              maxLength={80}
            />
          </View>

          {/* BASE */}
          <View style={styles.field}>
            <Text style={styles.label}>Destilado base</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {BASES.map(b => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => setBase(base === b ? '' : b)}
                    style={[styles.baseChip, base === b && styles.baseChipActive]}
                  >
                    <Text style={[styles.baseChipText, base === b && { color: '#fff' }]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* OBSERVAÇÕES */}
          <View style={styles.field}>
            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Ingredientes, onde você provou, por que gosta..."
              placeholderTextColor={colors.textLight}
              style={[styles.input, styles.textarea]}
              multiline
              numberOfLines={4}
              maxLength={400}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{notes.length}/400</Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.submitBtn}
          >
            {loading
              ? <ActivityIndicator color="#FFD966" />
              : <Text style={styles.submitText}>Enviar sugestão 🍹</Text>
            }
          </TouchableOpacity>
        </ScrollView>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.xl, paddingBottom: spacing.md,
  },
  headerBack: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBackIcon: { fontSize: 22, color: colors.text, lineHeight: 24 },
  headerTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },

  content: { paddingHorizontal: spacing.xl, paddingBottom: 80, gap: 20 },

  intro: {
    fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted,
    lineHeight: 21, backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 2, borderColor: '#F5F5F5',
  },

  field: { gap: 6 },
  label: { fontSize: 12, fontFamily: fonts.extraBold, color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, fontFamily: fonts.bold, color: colors.text,
    ...(Platform.OS === 'web' ? { outline: 'none' } : {}),
  },
  textarea: { height: 110, paddingTop: 12 },
  charCount: { fontSize: 11, fontFamily: fonts.semiBold, color: colors.textLight, alignSelf: 'flex-end', marginTop: 4 },

  baseChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
  },
  baseChipActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  baseChipText: { fontSize: 12, fontFamily: fonts.extraBold, color: '#666' },

  error: { fontSize: 13, fontFamily: fonts.semiBold, color: '#C0392B' },

  submitBtn: {
    backgroundColor: colors.dark, borderRadius: radius.md,
    paddingVertical: 16, alignItems: 'center', marginTop: 4,
    shadowColor: colors.dark, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 16, elevation: 8,
  },
  submitText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#fff' },

  // Done state
  doneWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 12 },
  doneTitle: { fontSize: 24, fontFamily: fonts.displayBold, color: colors.text },
  doneSub: {
    fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted,
    textAlign: 'center', lineHeight: 22,
  },
  backBtn: {
    marginTop: 12, backgroundColor: colors.dark, borderRadius: radius.md,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  backBtnText: { fontSize: 15, fontFamily: fonts.extraBold, color: '#fff' },
});
