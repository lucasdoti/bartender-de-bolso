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
import { useDrinks } from '../hooks/useDrinks';

// ─── FAMÍLIAS ────────────────────────────────────────────────────────────────
const FAMILIES = {
  negroni:         { ids: [5, 38, 33, 41, 49],        desc: 'estilo Negroni — amargo, encorpado, aperitivo' },
  sour:            { ids: [15, 46, 48, 37, 2, 12, 51, 53], desc: 'família Sour — espirituoso + cítrico + doce' },
  spritz:          { ids: [16, 29, 30, 24],             desc: 'estilo Spritz — leve, borbulhante, italiano' },
  tropical:        { ids: [3, 22, 23, 18],              desc: 'tropical — rum, coco e frutas' },
  caipirinha:      { ids: [17, 36, 32, 20, 49],         desc: 'família Caipirinha — cachaça e frutas' },
  martini:         { ids: [8, 9, 19, 50, 52],           desc: 'família Martini — elegante e spirit-forward' },
  collins:         { ids: [7, 27, 44, 4, 10, 31],       desc: 'estilo Collins / Highball — longo e refrescante' },
  bourbon_stirred: { ids: [14, 45, 38, 35, 46],         desc: 'bourbon clássico — encorpado e complexo' },
  cafe:            { ids: [19, 43],                      desc: 'drinks com café' },
};

const SIMILAR_TO = {
  'negroni':           'negroni',
  'americano':         'negroni',
  'boulevardier':      'negroni',
  'garibaldi':         'negroni',
  'rabo de galo':      'negroni',
  'aperol spritz':     'spritz',
  'spritz':            'spritz',
  'mimosa':            'spritz',
  'negroni sbagliato': 'spritz',
  'french 75':         'spritz',
  'caipirinha':        'caipirinha',
  'caipiroska':        'caipirinha',
  'batida':            'tropical',
  'old fashioned':     'bourbon_stirred',
  'manhattan':         'bourbon_stirred',
  'boulevardier':      'bourbon_stirred',
  'mint julep':        'bourbon_stirred',
  'new york sour':     'bourbon_stirred',
  'martini':           'martini',
  'dry martini':       'martini',
  'cosmopolitan':      'martini',
  'cosmo':             'martini',
  'espresso martini':  'cafe',
  'daiquiri':          'sour',
  'whisky sour':       'sour',
  'pisco sour':        'sour',
  'margarita':         'sour',
  "bee's knees":       'sour',
  'clover club':       'sour',
  'fitzgerald':        'sour',
  'pina colada':       'tropical',
  'piña colada':       'tropical',
  'mai tai':           'tropical',
  'gin tonica':        'collins',
  'gin tônica':        'collins',
  'tom collins':       'collins',
  'mojito':            'collins',
  'moscow mule':       'collins',
};

// ─── REGRAS ──────────────────────────────────────────────────────────────────
const RULES = [
  // Intensidade
  { words: ['forte', 'intenso', 'encorpado', 'concentrado', 'pesado', 'robusto', 'potente'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari', 'Rum'], w: 3 },
  { words: ['leve', 'suave', 'fraco', 'delicado', 'baixo teor', 'menos alcool', 'pouco alcool'], difficulty: 'Fácil', w: 2 },
  { words: ['spirit forward', 'puro', 'sem mistura', 'sem suco'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari'], w: 3 },

  // Clima / temperatura
  { words: ['refrescante', 'fresquinho', 'gelado', 'calor', 'verao', 'verão', 'quente', 'frescor', 'churrasco', 'churras', 'piscina', 'praia', 'tarde de sol'], tags: ['calor'], w: 3 },
  { words: ['aconchegante', 'frio', 'inverno', 'quentinho', 'aquece', 'friozinho', 'cobertor'], tags: ['frio'], w: 3 },

  // Ocasião
  { words: ['romantico', 'romantico', 'date', 'namorado', 'namorada', 'jantar', 'especial', 'sofisticado', 'elegante', 'chique', 'impressionar', 'surpreender', 'conquista'], tags: ['date'], w: 3 },
  { words: ['festa', 'festas', 'comemoracao', 'comemoração', 'celebracao', 'celebração', 'animado', 'balada', 'aniversario', 'aniversário', 'galera', 'turma', 'amigos', 'grupo'], tags: ['festas'], w: 3 },
  { words: ['sozinho', 'sozinha', 'so eu', 'só eu', 'relaxar', 'relaxando', 'tranquilo', 'sossego', 'descanso', 'serie', 'netflix', 'em casa', 'fim de dia'], tags: ['solo'], w: 3 },
  { words: ['ressaca', 'cansado', 'cansada', 'de leve hoje', 'nao exagerar', 'não exagerar'], tags: ['solo'], difficulty: 'Fácil', w: 3 },

  // Preparo / facilidade
  { words: ['rapido', 'rapida', 'pratico', 'pratica', 'simples de fazer', 'sem trabalho', 'sem muito preparo', 'iniciante', 'nunca fiz', 'primeira vez', 'comecando'], difficulty: 'Fácil', w: 3 },
  { words: ['sem coqueteleira', 'sem shaker', 'sem equipamento', 'so com copo', 'sem utensilios'], method: 'built', w: 4 },
  { words: ['mexido', 'so mexer', 'no copo', 'on the rocks', 'stirred'], method: 'stirred', w: 3 },

  // Estilo
  { words: ['classico', 'clássico', 'tradicional', 'atemporal', 'icone', 'ícone'], tags: ['classico'], w: 2 },
  { words: ['brasileiro', 'brasileira', 'brasil', 'nacional', 'cachaca', 'cachaça'], tags: ['brasil'], w: 4 },
  { words: ['italiano', 'italia', 'aperitivo', 'aperitif'], family: 'negroni', w: 3 },
  { words: ['tropical', 'caribenho', 'caribe'], family: 'tropical', w: 3 },
  { words: ['popular', 'famoso', 'mais pedido', 'mais conhecido', 'todo mundo conhece'], tags: ['popular'], w: 2 },

  // Sabor / perfil
  { words: ['amargo', 'bitter', 'bittersweet', 'amargura'], family: 'negroni', bases: ['Campari', 'Aperol', 'Vermute'], w: 3 },
  { words: ['doce', 'adocicado', 'dulce', 'docinho', 'suave doce'], bases: ['Rum', 'Aperol', 'Bourbon'], w: 2 },
  { words: ['citrico', 'cítrico', 'azedo', 'limao', 'limão', 'citrica', 'acido', 'ácido'], family: 'sour', bases: ['Gin', 'Vodka', 'Rum', 'Tequila', 'Cachaça'], w: 2 },
  { words: ['herbal', 'herbaceo', 'herbáceo', 'botanico', 'botânico', 'floral', 'aromatico', 'aromático', 'juniper'], bases: ['Gin', 'Vermute'], w: 3 },
  { words: ['defumado', 'smoky', 'turfa', 'amadeirado', 'carvalho', 'oak'], bases: ['Whisky', 'Bourbon'], w: 3 },
  { words: ['frutado', 'fruta', 'frutas'], bases: ['Rum', 'Vodka', 'Aperol', 'Tequila', 'Cachaça'], w: 1 },
  { words: ['cafe', 'café', 'espresso', 'coffee', 'cafezinho'], family: 'cafe', w: 4 },
  { words: ['cremoso', 'cremosa'], bases: ['Rum', 'Bourbon'], w: 2 },
  { words: ['borbulhante', 'espumante', 'com gas', 'com gás', 'prosecco', 'champagne', 'cava', 'espumoso'], family: 'spritz', w: 3 },
  { words: ['gengibre', 'picante', 'apimentado'], bases: ['Vodka', 'Whisky', 'Rum'], w: 2 },
  { words: ['hortela', 'hortelã', 'menta', 'mentol'], family: 'collins', bases: ['Rum', 'Gin'], w: 3 },
  { words: ['coco', 'colada'], family: 'tropical', bases: ['Rum', 'Cachaça'], w: 2 },
  { words: ['maracuja', 'maracujá', 'passion fruit'], bases: ['Vodka', 'Cachaça', 'Rum'], w: 2 },
  { words: ['morango', 'framboesa', 'berry', 'frutas vermelhas'], bases: ['Vodka', 'Gin', 'Rum'], w: 2 },

  // Drinks específicos
  { words: ['negroni'],                    family: 'negroni',         bases: ['Campari', 'Gin', 'Vermute'],   w: 5 },
  { words: ['boulevardier'],               family: 'negroni',         bases: ['Bourbon', 'Campari'],          w: 5 },
  { words: ['americano'],                  family: 'negroni',         bases: ['Campari', 'Vermute'],          w: 5 },
  { words: ['caipirinha'],                 family: 'caipirinha',      tags: ['brasil'],                       w: 5 },
  { words: ['mojito'],                     family: 'collins',         bases: ['Rum'], tags: ['calor'],        w: 5 },
  { words: ['margarita'],                  family: 'sour',            bases: ['Tequila'],                     w: 5 },
  { words: ['spritz', 'aperol spritz'],    family: 'spritz',          bases: ['Aperol'],                      w: 5 },
  { words: ['manhattan'],                  family: 'bourbon_stirred', bases: ['Bourbon'],                     w: 5 },
  { words: ['old fashioned'],              family: 'bourbon_stirred', bases: ['Bourbon'],                     w: 5 },
  { words: ['daiquiri'],                   family: 'sour',            bases: ['Rum'],                         w: 5 },
  { words: ['martini'],                    family: 'martini',         bases: ['Gin', 'Vodka'],                w: 5 },
  { words: ['cosmopolitan', 'cosmo'],      family: 'martini',         bases: ['Vodka'],                       w: 5 },
  { words: ['espresso martini'],           family: 'cafe',            bases: ['Vodka'],                       w: 5 },
  { words: ['whisky sour'],                family: 'sour',            bases: ['Whisky'],                      w: 5 },
  { words: ['pisco sour'],                 family: 'sour',            bases: ['Pisco'],                       w: 5 },
  { words: ['pina colada', 'piña colada'], family: 'tropical',        bases: ['Rum'],                         w: 5 },
  { words: ['gin tonica', 'gin tônica', 'gin and tonic'], family: 'collins', bases: ['Gin'],                 w: 5 },
  { words: ['rabo de galo'],               family: 'negroni',         tags: ['brasil'],                       w: 5 },
  { words: ['penicillin'],                                            bases: ['Whisky'],                      w: 5 },
  { words: ['french 75'],                  family: 'spritz',          bases: ['Gin'],                         w: 5 },
  { words: ['new york sour'],              family: 'bourbon_stirred', bases: ['Bourbon'],                     w: 5 },
  { words: ['moscow mule', 'moscow'],      family: 'collins',         bases: ['Vodka'],                       w: 5 },
  { words: ['mai tai'],                    family: 'tropical',        bases: ['Rum'],                         w: 5 },
  { words: ['bee knees', 'bees knees'],   family: 'sour',            bases: ['Gin'],                         w: 5 },
  { words: ['fitzgerald'],               family: 'sour',            bases: ['Gin'],                         w: 5 },

  // Bases diretas
  { words: ['whisky', 'whiskey', 'escoces', 'escocês', 'scotch'], bases: ['Whisky'], w: 4 },
  { words: ['bourbon'],                                              bases: ['Bourbon'], w: 4 },
  { words: ['gin'],                                                  bases: ['Gin'], w: 4 },
  { words: ['vodka'],                                                bases: ['Vodka'], w: 4 },
  { words: ['rum', 'rhum'],                                          bases: ['Rum'], w: 4 },
  { words: ['tequila', 'mezcal'],                                    bases: ['Tequila'], w: 4 },
  { words: ['aperol'],                                               bases: ['Aperol'], w: 4 },
  { words: ['campari'],                                              bases: ['Campari'], w: 4 },
  { words: ['vermute', 'vermouth'],                                  bases: ['Vermute'], w: 4 },
  { words: ['pisco'],                                                bases: ['Pisco'], w: 4 },
  { words: ['cachaca', 'cachaça'],                                   bases: ['Cachaça'], w: 4 },
];

// Padrões de negação — extrai o que vem após "sem", "não quero", etc.
const NEGATION_PATTERNS = [
  /\bsem\s+(\w+(?:\s\w+)?)/g,
  /\bn[aã]o\s+(?:quero|gosto\s+de|curto|seja)\s+(\w+(?:(?:\s+\w+){0,2})?)/g,
  /\bnada\s+de\s+(\w+(?:\s\w+)?)/g,
  /\bevitar?\s+(\w+(?:\s\w+)?)/g,
  /\bdetesto\s+(\w+(?:\s\w+)?)/g,
  /\bodeio\s+(\w+(?:\s\w+)?)/g,
];

// Ingredientes mencionados no texto → needs IDs dos drinks
const INGREDIENT_WORDS = {
  'rum':       ['rum'],
  'rhum':      ['rum'],
  'gin':       ['gin'],
  'vodka':     ['vodka'],
  'tequila':   ['tequila'],
  'mezcal':    ['tequila'],
  'cachaca':   ['cachaca'],
  'cachaça':   ['cachaca'],
  'whisky':    ['whisky'],
  'whiskey':   ['whisky'],
  'scotch':    ['whisky'],
  'bourbon':   ['bourbon'],
  'campari':   ['campari'],
  'aperol':    ['aperol'],
  'vermute':   ['vermute'],
  'vermouth':  ['vermute'],
  'limao':     ['limao_taiti', 'limao_siciliano'],
  'laranja':   ['laranja', 'sumo_laranja'],
  'hortela':   ['hortela'],
  'hortelã':   ['hortela'],
  'menta':     ['hortela'],
  'gengibre':  ['gengibre'],
  'cafe':      ['cafe'],
  'cafe':      ['cafe'],
  'espresso':  ['cafe'],
  'coco':      ['creme_coco', 'leite_coco'],
  'maracuja':  ['maracuja', 'xarope_maracuja'],
  'morango':   ['morango', 'xarope_morango'],
  'framboesa': ['xarope_framboesa'],
  'mel':       ['mel', 'xarope_mel'],
  'prosecco':  ['prosecco'],
  'angostura': ['angostura'],
};

const POPULAR_FALLBACK = [5, 15, 2, 16, 17, 8, 14, 33, 3, 7];

// ─── MOTOR ───────────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function abvNumber(drink) {
  return parseInt(drink.abv?.replace('%', '') || '0', 10);
}

function detectSimilarTo(normalized) {
  const patterns = [
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
  const result = new Set();
  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match) {
      const ref = normalizeText(match[1].trim().replace(/[.,!?]$/, ''));
      for (const [key, family] of Object.entries(SIMILAR_TO)) {
        if (ref.includes(normalizeText(key)) || normalizeText(key).includes(ref)) {
          result.add(family);
        }
      }
    }
  }
  return [...result];
}

function extractNegatedTerms(normalized) {
  const terms = new Set();
  for (const pattern of NEGATION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(normalized)) !== null) {
      terms.add(normalizeText(match[1].trim()));
    }
  }
  return [...terms];
}

function extractIngredientNeeds(normalized) {
  const needs = new Set();
  for (const [word, ids] of Object.entries(INGREDIENT_WORDS)) {
    if (normalized.includes(normalizeText(word))) {
      ids.forEach(id => needs.add(id));
    }
  }
  return [...needs];
}

function localRecommend(input, userBar = [], drinks = []) {
  const normalized = normalizeText(input);

  const similarFamilies    = detectSimilarTo(normalized);
  const negatedTerms       = extractNegatedTerms(normalized);
  const mentionedIngredients = extractIngredientNeeds(normalized);

  // Regras que batem com o texto E não estão negadas
  const activeRules = RULES.filter(rule =>
    rule.words.some(w => normalized.includes(normalizeText(w))) &&
    !rule.words.some(w => negatedTerms.some(neg =>
      normalizeText(w).includes(neg) || neg.includes(normalizeText(w))
    ))
  );

  // Regras explicitamente negadas pelo usuário
  const negatedRules = RULES.filter(rule =>
    rule.words.some(w => negatedTerms.some(neg =>
      normalizeText(w).includes(neg) || neg.includes(normalizeText(w))
    ))
  );

  const activeFamilyNames = new Set([
    ...activeRules.filter(r => r.family).map(r => r.family),
    ...similarFamilies,
  ]);

  const activeFamilyIds = new Set(
    [...activeFamilyNames].flatMap(name => FAMILIES[name]?.ids || [])
  );

  const wantsStrong = /\b(forte|intenso|potente|encorpado|pesado|robusto)\b/.test(normalized);
  const wantsLight  = /\b(leve|suave|fraco|delicado|baixo teor)\b/.test(normalized);

  const scored = drinks.map(drink => {
    let score = 0;
    const drinkAbv = abvNumber(drink);

    // Família
    if (activeFamilyIds.has(drink.id)) score += 4;

    // "Parecido com X" — peso extra
    for (const fam of similarFamilies) {
      if (FAMILIES[fam]?.ids.includes(drink.id)) score += 5;
    }

    // Regras positivas
    for (const rule of activeRules) {
      if (rule.tags)       score += rule.tags.filter(t => drink.tags.includes(t)).length * rule.w;
      if (rule.bases && rule.bases.includes(drink.base))     score += rule.w;
      if (rule.difficulty && drink.difficulty === rule.difficulty) score += rule.w;
      if (rule.method && drink.method === rule.method)       score += rule.w;
    }

    // Penalidade por negação
    for (const rule of negatedRules) {
      if (rule.bases && rule.bases.includes(drink.base))     score -= rule.w * 2;
      if (rule.tags)       score -= rule.tags.filter(t => drink.tags.includes(t)).length * rule.w * 2;
      if (rule.family && FAMILIES[rule.family]?.ids.includes(drink.id)) score -= 4;
    }

    // Ingredientes mencionados na query
    if (mentionedIngredients.length > 0) {
      const drinkNeeds = drink.needs || [];
      score += mentionedIngredients.filter(n => drinkNeeds.includes(n)).length * 2;
    }

    // Bar do usuário — prioriza o que já tem em casa
    if (userBar.length > 0) {
      const drinkNeeds = drink.needs || [];
      if (drinkNeeds.length > 0) {
        const hasAll  = drinkNeeds.every(n => userBar.includes(n));
        const hasSome = drinkNeeds.some(n => userBar.includes(n));
        if (hasAll)       score += 3;
        else if (hasSome) score += 1;
      }
    }

    // ABV como refinamento de força
    if (wantsStrong) score += Math.max(0, drinkAbv - 18) * 0.4;
    if (wantsLight)  score += Math.max(0, 16 - drinkAbv) * 0.4;

    return { drink, score };
  });

  const top = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.drink);

  // Fallback aleatório entre os populares
  if (top.length === 0) {
    const fallback = [...POPULAR_FALLBACK]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(id => drinks.find(d => d.id === id))
      .filter(Boolean);
    return {
      message: 'Não reconheci um estilo específico, mas aqui estão clássicos que raramente decepcionam:',
      result: fallback,
    };
  }

  // Mensagem contextualizada
  const allTags  = activeRules.flatMap(r => r.tags  || []);
  const allBases = activeRules.flatMap(r => r.bases || []);
  const allFams  = [...activeFamilyNames];

  let intro = 'Pelo que você descreveu';
  if (similarFamilies.length > 0) {
    const famDesc = FAMILIES[similarFamilies[0]]?.desc;
    intro = famDesc ? `Para quem curte o ${famDesc}` : 'Para um gosto parecido com o que você pediu';
  } else if (allTags.includes('calor'))             intro = 'Para refrescar e matar a sede';
  else if (allTags.includes('frio'))                intro = 'Para aquecer e aconchegar';
  else if (allTags.includes('date'))                intro = 'Para uma ocasião especial';
  else if (allTags.includes('festas'))              intro = 'Para animar a galera';
  else if (allTags.includes('solo'))                intro = 'Para um momento relaxante só seu';
  else if (allTags.includes('brasil'))              intro = 'Para celebrar com o que o Brasil tem de melhor';
  else if (allTags.includes('classico'))            intro = 'Para quem aprecia o que é atemporal';
  else if (allFams.includes('negroni'))             intro = 'Para os amantes do amargo e do aperitivo italiano';
  else if (allFams.includes('bourbon_stirred'))     intro = 'Para quem aprecia o bourbon encorpado e clássico';
  else if (allFams.includes('spritz'))              intro = 'Para algo leve, borbulhante e descomplicado';
  else if (allFams.includes('cafe'))                intro = 'Para quem quer o sabor do café no copo';
  else if (allBases.includes('Whisky') || allBases.includes('Bourbon')) intro = 'Para os que gostam de intensidade e complexidade';
  else if (allBases.includes('Gin'))                intro = 'Para os amantes do aromático e botânico';
  else if (allBases.includes('Rum'))                intro = 'Para quem curte o charme caribenho';
  else if (allBases.includes('Tequila'))            intro = 'Para os apreciadores do agave';

  const extras = [];
  if (negatedRules.length > 0) extras.push('levando em conta o que você não quer');
  if (userBar.length > 0)      extras.push('priorizando o que você tem no bar');
  const extrasStr = extras.length > 0 ? ` (${extras.join(' e ')})` : '';

  const tagLabels = { calor: 'refrescante', frio: 'aconchegante', date: 'para ocasiões especiais', festas: 'para festas', solo: 'para relaxar', brasil: 'brasileiro', classico: 'clássico', popular: 'popular' };

  const drinkLines = top.map(d => {
    const reasons = [];
    if (activeRules.some(r => r.bases?.includes(d.base))) reasons.push(`leva ${d.base}`);
    const matchedTags = d.tags.filter(t => allTags.includes(t));
    if (matchedTags.length > 0) reasons.push(matchedTags.slice(0, 2).map(t => tagLabels[t] || t).join(', '));
    if (userBar.length > 0 && (d.needs || []).every(n => userBar.includes(n))) reasons.push('você tem os ingredientes');
    const reasonStr = reasons.length > 0 ? ` (${reasons.slice(0, 2).join(', ')})` : '';
    return `• ${d.name}${reasonStr} — ${d.subtitle}`;
  });

  const message = `${intro}${extrasStr}, aqui estão minhas indicações:\n\n${drinkLines.join('\n')}\n\nClique em qualquer card para ver a receita completa!`;

  return { message, result: top };
}

// ─── TELA ─────────────────────────────────────────────────────────────────────

const EXAMPLES = [
  'Algo refrescante para o calor, sem gin',
  'Parecido com Negroni, mas diferente',
  'Drink leve pra fazer em casa sem coqueteleira',
  'Algo sofisticado para uma janta especial',
];

export default function BartenderIAScreen({ navigation }) {
  const { favorites, toggleFavorite, ingredients: userBar, ratings } = useApp();
  const drinks = useDrinks();
  const [input, setInput]           = useState('');
  const [response, setResponse]     = useState(null);
  const [recommended, setRecommended] = useState([]);

  const handleSend = () => {
    if (!input.trim()) return;
    const { message, result } = localRecommend(input.trim(), userBar, drinks);
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
                  Me conta o que você está com vontade de tomar. Algo mais forte? Refrescante? Parecido com algum drink que você já provou? Posso até usar o que você tem no bar!
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
                      rating={ratings[drink.id]}
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
