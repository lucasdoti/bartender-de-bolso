import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import { DrinkCardList } from '../components/DrinkCard';
import AppIcon from '../components/AppIcon';
import drinks from '../data/drinks';

const ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_KEY;

const CATALOG = drinks
  .map(d => `${d.name} | Base: ${d.base} | ${d.difficulty} | ${d.subtitle} | Tags: ${d.tags.join(', ')}`)
  .join('\n');

const SYSTEM = `Você é Bolso, um bartender experiente, simpático e com personalidade. Você conhece este cardápio:

${CATALOG}

Regras:
- Recomende 2 a 3 drinks do cardápio acima que melhor atendam ao pedido do cliente
- Mencione os nomes EXATAMENTE como estão no cardápio (ex: "Negroni", "Aperol Spritz")
- Seja caloroso e profissional, como um bartender real faria
- Explique brevemente por que cada drink combina com o pedido
- Responda sempre em português brasileiro
- Máximo 130 palavras
- Não invente drinks que não estão no cardápio`;

async function askBartender(message) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM,
      messages: [{ role: 'user', content: message }],
    }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text || '';
}

function findRecommendedDrinks(text) {
  return drinks.filter(d => new RegExp(d.name, 'i').test(text));
}

const EXAMPLES = [
  'Quero algo forte e concentrado, parecido com Negroni',
  'Drink leve e refrescante para o calor',
  'Algo sofisticado para uma janta especial',
  'Drink brasileiro, com identidade',
];

export default function BartenderIAScreen({ navigation }) {
  const { favorites, toggleFavorite } = useApp();
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [response, setResponse]     = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [error, setError]           = useState(null);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResponse(null);
    setRecommended([]);
    setError(null);
    try {
      const text = await askBartender(input.trim());
      setResponse(text);
      setRecommended(findRecommendedDrinks(text));
    } catch {
      setError('Não consegui conectar com o bartender. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResponse(null);
    setRecommended([]);
    setError(null);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Bartender IA</Text>
        <AppIcon size={38} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* INTRO */}
          {!response && !loading && !error && (
            <>
              <View style={styles.introCard}>
                <Text style={styles.introEmoji}>🍸</Text>
                <Text style={styles.introTitle}>Olá! Eu sou o Bolso</Text>
                <Text style={styles.introSub}>
                  Me conta o que você está com vontade de tomar. Algo mais forte? Refrescante? Parecido com algum drink que você já provou? Eu indico o ideal pra você.
                </Text>
              </View>

              <Text style={styles.sectionLabel}>Sugestões de pedido</Text>
              {EXAMPLES.map(ex => (
                <TouchableOpacity key={ex} onPress={() => setInput(ex)} style={styles.exampleChip}>
                  <Text style={styles.exampleText}>{ex}</Text>
                  <Text style={styles.exampleArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* LOADING */}
          {loading && (
            <View style={styles.loadingCard}>
              <ActivityIndicator color={colors.primary} size="large" />
              <Text style={styles.loadingText}>O Bolso está pensando...</Text>
            </View>
          )}

          {/* ERRO */}
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={reset} style={styles.tryAgainBtn}>
                <Text style={styles.tryAgainText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* RESPOSTA */}
          {response && (
            <>
              <View style={styles.responseCard}>
                <Text style={styles.responseLabel}>✦ Bolso recomenda</Text>
                <Text style={styles.responseText}>{response}</Text>
              </View>

              {recommended.length > 0 && (
                <View style={{ gap: 10, marginTop: 20 }}>
                  <Text style={styles.sectionLabel}>Drinks sugeridos</Text>
                  {recommended.map(drink => (
                    <DrinkCardList
                      key={drink.id}
                      drink={drink}
                      isFavorite={favorites.includes(drink.id)}
                      onPress={() => navigation.navigate('DrinkDetail', { drinkId: drink.id })}
                      onFavorite={() => toggleFavorite(drink.id)}
                    />
                  ))}
                </View>
              )}

              <TouchableOpacity onPress={reset} style={styles.resetBtn}>
                <Text style={styles.resetText}>Fazer outro pedido</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* INPUT */}
        {!response && !error && (
          <View style={styles.inputRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="O que você está com vontade de tomar?"
              placeholderTextColor={colors.textLight}
              style={styles.input}
              multiline
              maxLength={200}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={!input.trim() || loading}
              style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.xl, paddingBottom: spacing.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: radius.sm,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: colors.text, lineHeight: 24 },
  navTitle: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },

  content: { padding: spacing.xl, paddingBottom: 32, gap: 10 },

  introCard: {
    backgroundColor: colors.dark, borderRadius: radius.xl,
    padding: spacing.lg, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,210,80,0.12)',
  },
  introEmoji: { fontSize: 32, marginBottom: 10 },
  introTitle: { fontSize: 20, fontFamily: fonts.extraBold, color: '#FFD966', marginBottom: 8 },
  introSub: { fontSize: 14, fontFamily: fonts.semiBold, color: '#aaa', lineHeight: 21 },

  sectionLabel: {
    fontSize: 11, fontFamily: fonts.extraBold, color: colors.textMuted,
    letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, marginTop: 8,
  },
  exampleChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  exampleText: { fontSize: 13, fontFamily: fonts.semiBold, color: colors.text, flex: 1 },
  exampleArrow: { fontSize: 18, color: colors.textLight },

  loadingCard: { alignItems: 'center', paddingVertical: 80, gap: 16 },
  loadingText: { fontSize: 14, fontFamily: fonts.semiBold, color: colors.textMuted },

  errorCard: {
    backgroundColor: '#FFF0F0', borderRadius: radius.lg,
    padding: spacing.lg, alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  errorText: { fontSize: 13, fontFamily: fonts.semiBold, color: '#C62828', textAlign: 'center', lineHeight: 20 },
  tryAgainBtn: {
    backgroundColor: '#C62828', borderRadius: radius.md,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  tryAgainText: { fontSize: 13, fontFamily: fonts.extraBold, color: '#fff' },

  responseCard: {
    backgroundColor: colors.dark, borderRadius: radius.xl,
    padding: spacing.lg, borderWidth: 1, borderColor: 'rgba(255,210,80,0.15)',
  },
  responseLabel: {
    fontSize: 11, fontFamily: fonts.extraBold, color: '#B8860B',
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10,
  },
  responseText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#ddd', lineHeight: 22 },

  resetBtn: {
    marginTop: 12, backgroundColor: colors.surface, borderRadius: radius.md,
    borderWidth: 2, borderColor: colors.border, paddingVertical: 14, alignItems: 'center',
  },
  resetText: { fontSize: 14, fontFamily: fonts.extraBold, color: colors.text },

  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: spacing.xl, paddingVertical: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1.5, borderTopColor: colors.border,
  },
  input: {
    flex: 1, fontSize: 14, fontFamily: fonts.semiBold, color: colors.text,
    maxHeight: 80, paddingTop: 4,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.dark, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.35 },
  sendIcon: { fontSize: 18, color: '#FFD966', fontFamily: fonts.extraBold, lineHeight: 22 },
});
