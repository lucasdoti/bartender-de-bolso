import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, fonts, radius, spacing } from '../theme';
import { DrinkCardList } from '../components/DrinkCard';
import AppIcon from '../components/AppIcon';
import drinks from '../data/drinks';

// ─── MOTOR DE RECOMENDAÇÃO ────────────────────────────────────────────────────

const RULES = [
  // Intensidade
  { words: ['forte', 'intenso', 'encorpado', 'concentrado', 'pesado', 'robusto'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari', 'Rum'], w: 3 },
  { words: ['leve', 'suave', 'fraco', 'delicado', 'leves'], difficulty: 'Fácil', w: 2 },

  // Temperatura / clima
  { words: ['refrescante', 'fresquinho', 'gelado', 'calor', 'verão', 'verao', 'quente'], tags: ['calor'], w: 3 },
  { words: ['aconchegante', 'frio', 'inverno', 'quentinho', 'aquece'], tags: ['frio'], w: 3 },

  // Ocasião
  { words: ['romântico', 'romantico', 'date', 'namorado', 'namorada', 'jantar', 'especial', 'sofisticado', 'elegante'], tags: ['date'], w: 3 },
  { words: ['festa', 'festas', 'comemoração', 'comemoracao', 'celebração', 'celebracao', 'animado', 'balada', 'aniversário', 'aniversario'], tags: ['festas'], w: 3 },
  { words: ['sozinho', 'sozinha', 'só', 'relaxar', 'relaxando', 'tranquilo', 'sossego', 'descanso'], tags: ['solo'], w: 3 },

  // Estilo
  { words: ['clássico', 'classico', 'tradicional', 'atemporal'], tags: ['classico'], w: 2 },
  { words: ['brasileiro', 'brasileira', 'brasil', 'nacional', 'cachaça', 'cachaca'], tags: ['brasil'], w: 4 },

  // Sabor
  { words: ['amargo', 'bitter', 'aperitivo'], bases: ['Campari', 'Aperol', 'Vermute'], w: 3 },
  { words: ['doce', 'adocicado'], bases: ['Rum', 'Aperol', 'Bourbon'], w: 2 },
  { words: ['cítrico', 'citrico', 'azedo', 'limão', 'limao'], bases: ['Gin', 'Vodka', 'Rum', 'Tequila', 'Cachaça'], w: 2 },
  { words: ['herbal', 'herbáceo', 'herbaceo', 'botânico', 'botanico', 'floral', 'aromático', 'aromatico'], bases: ['Gin', 'Vermute'], w: 3 },
  { words: ['defumado', 'smoky', 'turfa', 'amadeirado'], bases: ['Whisky', 'Bourbon'], w: 3 },
  { words: ['frutado', 'fruta', 'tropical'], bases: ['Rum', 'Vodka', 'Aperol', 'Tequila', 'Cachaça'], w: 1 },

  // Referências a drinks famosos
  { words: ['negroni'], bases: ['Campari', 'Gin', 'Vermute'], w: 5 },
  { words: ['caipirinha'], tags: ['brasil'], bases: ['Cachaça'], w: 5 },
  { words: ['mojito'], bases: ['Rum'], tags: ['calor'], w: 5 },
  { words: ['margarita'], bases: ['Tequila'], w: 5 },
  { words: ['spritz', 'aperol spritz'], bases: ['Aperol'], w: 5 },
  { words: ['manhattan', 'boulevardier'], bases: ['Bourbon', 'Whisky'], w: 5 },
  { words: ['old fashioned'], bases: ['Bourbon'], w: 5 },
  { words: ['daiquiri'], bases: ['Rum'], w: 5 },
  { words: ['martini'], bases: ['Gin', 'Vodka'], w: 5 },
  { words: ['americano'], bases: ['Campari', 'Vermute'], w: 5 },

  // Bases mencionadas diretamente
  { words: ['whisky', 'whiskey', 'escocês', 'escoces', 'scotch'], bases: ['Whisky'], w: 4 },
  { words: ['bourbon'], bases: ['Bourbon'], w: 4 },
  { words: ['gin'], bases: ['Gin'], w: 4 },
  { words: ['vodka'], bases: ['Vodka'], w: 4 },
  { words: ['rum', 'rhum'], bases: ['Rum'], w: 4 },
  { words: ['tequila', 'mezcal'], bases: ['Tequila'], w: 4 },
  { words: ['aperol'], bases: ['Aperol'], w: 4 },
  { words: ['campari'], bases: ['Campari'], w: 4 },
  { words: ['vermute', 'vermouth'], bases: ['Vermute'], w: 4 },
];

function normalizeText(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function localRecommend(input) {
  const normalized = normalizeText(input);

  // Encontra as regras ativas
  const activeRules = RULES.filter(rule =>
    rule.words.some(w => normalized.includes(normalizeText(w)))
  );

  // Pontua cada drink
  const scored = drinks.map(drink => {
    let score = 0;
    for (const rule of activeRules) {
      if (rule.tags) {
        const hits = rule.tags.filter(t => drink.tags.includes(t)).length;
        score += hits * rule.w;
      }
      if (rule.bases && rule.bases.includes(drink.base)) {
        score += rule.w;
      }
      if (rule.difficulty && drink.difficulty === rule.difficulty) {
        score += rule.w;
      }
    }
    return { drink, score };
  });

  // Ordena e pega o top 3 com score > 0
  const top = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.drink);

  // Fallback: drinks populares se nada foi encontrado
  const result = top.length > 0 ? top : drinks.slice(0, 3);

  // Gera mensagem baseada nas regras ativas
  const allTags  = activeRules.flatMap(r => r.tags  || []);
  const allBases = activeRules.flatMap(r => r.bases || []);

  let intro = 'Pelo que você descreveu';
  if (allTags.includes('calor'))    intro = 'Para refrescar e matar a sede';
  else if (allTags.includes('frio'))     intro = 'Para aquecer e aconchegar';
  else if (allTags.includes('date'))     intro = 'Para uma ocasião especial';
  else if (allTags.includes('festas'))   intro = 'Para animar a festa';
  else if (allTags.includes('solo'))     intro = 'Para um momento relaxante só seu';
  else if (allTags.includes('brasil'))   intro = 'Para celebrar com o que o Brasil tem de melhor';
  else if (allTags.includes('classico')) intro = 'Para quem aprecia o que é atemporal';
  else if (allBases.includes('Whisky') || allBases.includes('Bourbon')) intro = 'Para os que gostam de intensidade e complexidade';
  else if (allBases.includes('Gin'))     intro = 'Para os amantes do aromático e botânico';
  else if (allBases.includes('Rum'))     intro = 'Para quem curte o charme caribenho';
  else if (allBases.includes('Tequila')) intro = 'Para os apreciadores do agave';
  else if (allBases.includes('Campari') || allBases.includes('Aperol')) intro = 'Para os fãs do estilo italiano aperitivo';

  const fallback = top.length === 0;
  const message = fallback
    ? 'Não reconheci um estilo específico, mas aqui estão clássicos que raramente decepcionam:'
    : `${intro}, aqui estão minhas indicações:\n\n${result.map(d => `• ${d.name} — ${d.subtitle}`).join('\n')}\n\nClique em qualquer card para ver a receita completa!`;

  return { message, result };
}

// ─── TELA ─────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Quero algo forte e concentrado, parecido com Negroni',
  'Drink leve e refrescante para o calor',
  'Algo sofisticado para uma janta especial',
  'Drink brasileiro com identidade',
];

export default function BartenderIAScreen({ navigation }) {
  const { favorites, toggleFavorite } = useApp();
  const [input, setInput]             = useState('');
  const [response, setResponse]       = useState(null);
  const [recommended, setRecommended] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;
    const { message, result } = localRecommend(input.trim());
    setResponse(message);
    setRecommended(result);
  };

  const reset = () => {
    setResponse(null);
    setRecommended([]);
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
          {!response && (
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
        {!response && (
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
              disabled={!input.trim()}
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
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
