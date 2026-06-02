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

// ─── FAMÍLIAS DE DRINKS ───────────────────────────────────────────────────────
// Agrupa drinks por perfil de sabor e estrutura.
// "Parecido com Negroni" → família inteira (Boulevardier, Americano, Rabo de Galo…)
const FAMILIES = {
  negroni:         { ids: [5, 38, 33, 41, 49],        desc: 'estilo Negroni — amargo, encorpado, aperitivo' },
  sour:            { ids: [15, 46, 48, 37, 2, 12, 51], desc: 'família Sour — espirituoso + cítrico + doce' },
  spritz:          { ids: [16, 29, 30, 24],             desc: 'estilo Spritz — leve, borbulhante, italiano' },
  tropical:        { ids: [3, 22, 23, 18],              desc: 'tropical — rum, coco e frutas' },
  caipirinha:      { ids: [17, 36, 32, 20, 49],         desc: 'família Caipirinha — cachaça e frutas' },
  martini:         { ids: [8, 9, 19, 50, 52],           desc: 'família Martini — elegante e spirit-forward' },
  collins:         { ids: [7, 27, 44, 4, 10, 31],       desc: 'estilo Collins / Highball — longo e refrescante' },
  bourbon_stirred: { ids: [14, 45, 38, 35, 46],         desc: 'bourbon clássico — encorpado e complexo' },
  cafe:            { ids: [19, 43],                      desc: 'drinks com café' },
};

// Mapeia nomes de drinks para sua família — permite "parecido com X" funcionar
const SIMILAR_TO = {
  'negroni':          'negroni',
  'americano':        'negroni',
  'boulevardier':     'negroni',
  'garibaldi':        'negroni',
  'rabo de galo':     'negroni',
  'aperol spritz':    'spritz',
  'spritz':           'spritz',
  'mimosa':           'spritz',
  'negroni sbagliato': 'spritz',
  'caipirinha':       'caipirinha',
  'caipiroska':       'caipirinha',
  'old fashioned':    'bourbon_stirred',
  'manhattan':        'bourbon_stirred',
  'boulevardier':     'bourbon_stirred',
  'mint julep':       'bourbon_stirred',
  'new york sour':    'bourbon_stirred',
  'martini':          'martini',
  'dry martini':      'martini',
  'cosmopolitan':     'martini',
  'espresso martini': 'martini',
  'daiquiri':         'sour',
  'whisky sour':      'sour',
  'pisco sour':       'sour',
  'margarita':        'sour',
  "bee's knees":      'sour',
  'piña colada':      'tropical',
  'mai tai':          'tropical',
  'gin tônica':       'collins',
  'gin tonica':       'collins',
  'tom collins':      'collins',
  'mojito':           'collins',
};

// ─── REGRAS DE KEYWORDS ──────────────────────────────────────────────────────
// w = peso; family = família de drinks a boostar; tags/bases = filtros diretos
const RULES = [
  // Intensidade
  { words: ['forte', 'intenso', 'encorpado', 'concentrado', 'pesado', 'robusto', 'potente'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari', 'Rum'], w: 3 },
  { words: ['leve', 'suave', 'fraco', 'delicado', 'tranquilo'], difficulty: 'Fácil', w: 2 },
  { words: ['spirit forward', 'puro', 'sem mistura', 'sem suco'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari'], w: 3 },

  // Temperatura / clima
  { words: ['refrescante', 'fresquinho', 'gelado', 'calor', 'verão', 'verao', 'quente', 'frescor'], tags: ['calor'], w: 3 },
  { words: ['aconchegante', 'frio', 'inverno', 'quentinho', 'aquece'], tags: ['frio'], w: 3 },

  // Ocasião
  { words: ['romântico', 'romantico', 'date', 'namorado', 'namorada', 'jantar', 'especial', 'sofisticado', 'elegante', 'chique'], tags: ['date'], w: 3 },
  { words: ['festa', 'festas', 'comemoração', 'comemoracao', 'celebração', 'celebracao', 'animado', 'balada', 'aniversário', 'aniversario'], tags: ['festas'], w: 3 },
  { words: ['sozinho', 'sozinha', 'só', 'relaxar', 'relaxando', 'tranquilo', 'sossego', 'descanso'], tags: ['solo'], w: 3 },

  // Estilo geral
  { words: ['clássico', 'classico', 'tradicional', 'atemporal', 'ícone', 'icone'], tags: ['classico'], w: 2 },
  { words: ['brasileiro', 'brasileira', 'brasil', 'nacional', 'cachaça', 'cachaca'], tags: ['brasil'], w: 4 },
  { words: ['italiano', 'italia', 'aperitivo', 'aperitif'], family: 'negroni', w: 3 },
  { words: ['tropical', 'caribenho', 'caribe', 'verão tropical'], family: 'tropical', w: 3 },

  // Sabor / perfil
  { words: ['amargo', 'bitter', 'bittersweet', 'amargos', 'amargura'], family: 'negroni', bases: ['Campari', 'Aperol', 'Vermute'], w: 3 },
  { words: ['doce', 'adocicado', 'dulce'], bases: ['Rum', 'Aperol', 'Bourbon'], w: 2 },
  { words: ['cítrico', 'citrico', 'azedo', 'limão', 'limao', 'cítrica'], family: 'sour', bases: ['Gin', 'Vodka', 'Rum', 'Tequila', 'Cachaça'], w: 2 },
  { words: ['herbal', 'herbáceo', 'herbaceo', 'botânico', 'botanico', 'floral', 'aromático', 'aromatico', 'juniper'], bases: ['Gin', 'Vermute'], w: 3 },
  { words: ['defumado', 'smoky', 'turfa', 'amadeirado', 'carvalho'], bases: ['Whisky', 'Bourbon'], w: 3 },
  { words: ['frutado', 'fruta', 'frutas'], bases: ['Rum', 'Vodka', 'Aperol', 'Tequila', 'Cachaça'], w: 1 },
  { words: ['café', 'cafe', 'espresso', 'coffee'], family: 'cafe', w: 4 },
  { words: ['cremoso', 'cremosa', 'encorpado'], bases: ['Rum', 'Bourbon'], w: 2 },
  { words: ['borbulhante', 'espumante', 'com gás', 'com gas', 'prosecco', 'champagne', 'cava'], family: 'spritz', w: 3 },

  // Referências diretas a drinks — dispara família + base
  { words: ['negroni'],          family: 'negroni',         bases: ['Campari', 'Gin', 'Vermute'],   w: 5 },
  { words: ['boulevardier'],     family: 'negroni',         bases: ['Bourbon', 'Campari'],          w: 5 },
  { words: ['americano'],        family: 'negroni',         bases: ['Campari', 'Vermute'],          w: 5 },
  { words: ['caipirinha'],       family: 'caipirinha',      tags: ['brasil'],                        w: 5 },
  { words: ['mojito'],           family: 'collins',         bases: ['Rum'], tags: ['calor'],         w: 5 },
  { words: ['margarita'],        family: 'sour',            bases: ['Tequila'],                      w: 5 },
  { words: ['spritz', 'aperol spritz'], family: 'spritz',   bases: ['Aperol'],                       w: 5 },
  { words: ['manhattan'],        family: 'bourbon_stirred', bases: ['Bourbon'],                      w: 5 },
  { words: ['old fashioned'],    family: 'bourbon_stirred', bases: ['Bourbon'],                      w: 5 },
  { words: ['daiquiri'],         family: 'sour',            bases: ['Rum'],                          w: 5 },
  { words: ['martini'],          family: 'martini',         bases: ['Gin', 'Vodka'],                 w: 5 },
  { words: ['cosmopolitan', 'cosmo'], family: 'martini',    bases: ['Vodka'],                        w: 5 },
  { words: ['espresso martini'], family: 'cafe',            bases: ['Vodka'],                        w: 5 },
  { words: ['whisky sour'],      family: 'sour',            bases: ['Whisky'],                       w: 5 },
  { words: ['pisco sour'],       family: 'sour',            bases: ['Pisco'],                        w: 5 },
  { words: ['piña colada', 'pina colada'], family: 'tropical', bases: ['Rum'],                      w: 5 },
  { words: ['gin tônica', 'gin tonica', 'gin and tonic'], family: 'collins', bases: ['Gin'],        w: 5 },
  { words: ['rabo de galo'],     family: 'negroni',         tags: ['brasil'],                        w: 5 },
  { words: ['penicillin'],                                  bases: ['Whisky'],                       w: 5 },
  { words: ['french 75'],        family: 'spritz',          bases: ['Gin'],                          w: 5 },
  { words: ['new york sour'],    family: 'bourbon_stirred', bases: ['Bourbon'],                      w: 5 },

  // Bases mencionadas diretamente
  { words: ['whisky', 'whiskey', 'escocês', 'escoces', 'scotch'], bases: ['Whisky'], w: 4 },
  { words: ['bourbon', 'americano whiskey'], bases: ['Bourbon'], w: 4 },
  { words: ['gin'], bases: ['Gin'], w: 4 },
  { words: ['vodka'], bases: ['Vodka'], w: 4 },
  { words: ['rum', 'rhum'], bases: ['Rum'], w: 4 },
  { words: ['tequila', 'mezcal'], bases: ['Tequila'], w: 4 },
  { words: ['aperol'], bases: ['Aperol'], w: 4 },
  { words: ['campari'], bases: ['Campari'], w: 4 },
  { words: ['vermute', 'vermouth'], bases: ['Vermute'], w: 4 },
  { words: ['pisco'], bases: ['Pisco'], w: 4 },
];

// ─── MOTOR ───────────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Detecta "parecido com X", "tipo X", "estilo X", "como o X" e retorna família de X
function detectSimilarTo(normalized) {
  const similarPatterns = [
    /parecido com (.+)/,
    /parecida com (.+)/,
    /tipo (.+)/,
    /estilo (.+)/,
    /como o (.+)/,
    /como a (.+)/,
    /como um (.+)/,
    /como uma (.+)/,
    /inspirado (?:no|na|em) (.+)/,
    /no estilo (?:do|da|de)? ?(.+)/,
  ];

  const families = new Set();
  for (const pattern of similarPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const ref = normalizeText(match[1].trim().replace(/[.,!?]$/, ''));
      for (const [key, family] of Object.entries(SIMILAR_TO)) {
        if (ref.includes(normalizeText(key)) || normalizeText(key).includes(ref)) {
          if (family) families.add(family);
        }
      }
    }
  }
  return [...families];
}

function localRecommend(input) {
  const normalized = normalizeText(input);

  // Detecta referências do tipo "parecido com X"
  const similarFamilies = detectSimilarTo(normalized);

  // Encontra as regras ativas por keyword
  const activeRules = RULES.filter(rule =>
    rule.words.some(w => normalized.includes(normalizeText(w)))
  );

  // Coleta famílias das regras ativas
  const activeFamilyNames = new Set([
    ...activeRules.filter(r => r.family).map(r => r.family),
    ...similarFamilies,
  ]);

  const activeFamilyIds = new Set(
    [...activeFamilyNames].flatMap(name => FAMILIES[name]?.ids || [])
  );

  // Pontua cada drink
  const scored = drinks.map(drink => {
    let score = 0;

    // Pontuação por família (estrutural similarity)
    if (activeFamilyIds.has(drink.id)) {
      score += 4;
    }

    // Pontuação por "parecido com" — peso extra para drinks da mesma família do drink referenciado
    if (similarFamilies.length > 0) {
      for (const familyName of similarFamilies) {
        if (FAMILIES[familyName]?.ids.includes(drink.id)) {
          score += 5;
        }
      }
    }

    // Pontuação pelas regras (tags, bases, dificuldade)
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

  // Top 3 com score > 0
  const top = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.drink);

  // Fallback se nada encontrado
  const result = top.length > 0 ? top : [drinks[4], drinks[0], drinks[14]];

  // Gera mensagem contextualizada
  const allTags   = activeRules.flatMap(r => r.tags  || []);
  const allBases  = activeRules.flatMap(r => r.bases || []);
  const allFams   = [...activeFamilyNames];

  let intro = 'Pelo que você descreveu';
  if (similarFamilies.length > 0) {
    const famDesc = FAMILIES[similarFamilies[0]]?.desc;
    intro = famDesc ? `Para quem curte o ${famDesc}` : 'Para um gosto parecido com o que você pediu';
  } else if (allTags.includes('calor'))    intro = 'Para refrescar e matar a sede';
  else if (allTags.includes('frio'))       intro = 'Para aquecer e aconchegar';
  else if (allTags.includes('date'))       intro = 'Para uma ocasião especial';
  else if (allTags.includes('festas'))     intro = 'Para animar a festa';
  else if (allTags.includes('solo'))       intro = 'Para um momento relaxante só seu';
  else if (allTags.includes('brasil'))     intro = 'Para celebrar com o que o Brasil tem de melhor';
  else if (allTags.includes('classico'))   intro = 'Para quem aprecia o que é atemporal';
  else if (allFams.includes('negroni'))    intro = 'Para os amantes do amargo e do aperitivo italiano';
  else if (allFams.includes('bourbon_stirred')) intro = 'Para quem aprecia o bourbon encorpado e clássico';
  else if (allFams.includes('spritz'))     intro = 'Para algo leve, borbulhante e descomplicado';
  else if (allFams.includes('cafe'))       intro = 'Para quem quer o sabor do café no copo';
  else if (allBases.includes('Whisky') || allBases.includes('Bourbon')) intro = 'Para os que gostam de intensidade e complexidade';
  else if (allBases.includes('Gin'))       intro = 'Para os amantes do aromático e botânico';
  else if (allBases.includes('Rum'))       intro = 'Para quem curte o charme caribenho';
  else if (allBases.includes('Tequila'))   intro = 'Para os apreciadores do agave';

  const fallback = top.length === 0;
  const message = fallback
    ? 'Não reconheci um estilo específico, mas aqui estão clássicos que raramente decepcionam:'
    : `${intro}, aqui estão minhas indicações:\n\n${result.map(d => `• ${d.name} — ${d.subtitle}`).join('\n')}\n\nClique em qualquer card para ver a receita completa!`;

  return { message, result };
}

// ─── TELA ─────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Quero algo parecido com Negroni, mas diferente',
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
