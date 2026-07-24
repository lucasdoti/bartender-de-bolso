import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors, fonts, radius, spacing } from '../theme';
import { DrinkCardList } from '../components/DrinkCard';
import { useDrinks } from '../hooks/useDrinks';

// ─── FAMÍLIAS ────────────────────────────────────────────────────────────────
const FAMILIES = {
  negroni:         { ids: [5, 38, 33, 41, 49],            desc: 'estilo Negroni' },
  sour:            { ids: [15, 46, 48, 37, 2, 12, 51, 53], desc: 'família Sour' },
  spritz:          { ids: [16, 29, 30, 24],                desc: 'estilo Spritz' },
  tropical:        { ids: [3, 22, 23, 18],                 desc: 'tropical' },
  caipirinha:      { ids: [17, 36, 32, 20, 49],            desc: 'família Caipirinha' },
  martini:         { ids: [8, 9, 19, 50, 52],              desc: 'família Martini' },
  collins:         { ids: [7, 27, 44, 4, 10, 31],          desc: 'estilo Collins' },
  bourbon_stirred: { ids: [14, 45, 38, 35, 46],            desc: 'bourbon clássico' },
  cafe:            { ids: [19, 43],                        desc: 'drinks com café' },
};

const SIMILAR_TO = {
  'negroni': 'negroni', 'americano': 'negroni', 'boulevardier': 'negroni',
  'garibaldi': 'negroni', 'rabo de galo': 'negroni',
  'aperol spritz': 'spritz', 'spritz': 'spritz', 'mimosa': 'spritz',
  'negroni sbagliato': 'spritz', 'french 75': 'spritz',
  'caipirinha': 'caipirinha', 'caipiroska': 'caipirinha', 'batida': 'tropical',
  'old fashioned': 'bourbon_stirred', 'manhattan': 'bourbon_stirred',
  'mint julep': 'bourbon_stirred', 'new york sour': 'bourbon_stirred',
  'martini': 'martini', 'dry martini': 'martini', 'cosmopolitan': 'martini',
  'cosmo': 'martini', 'espresso martini': 'cafe', 'daiquiri': 'sour',
  'whisky sour': 'sour', 'pisco sour': 'sour', 'margarita': 'sour',
  "bee's knees": 'sour', 'clover club': 'sour', 'fitzgerald': 'sour',
  'pina colada': 'tropical', 'piña colada': 'tropical', 'mai tai': 'tropical',
  'gin tonica': 'collins', 'gin tônica': 'collins', 'tom collins': 'collins',
  'mojito': 'collins', 'moscow mule': 'collins',
};

const RULES = [
  { words: ['forte', 'intenso', 'encorpado', 'concentrado', 'pesado', 'robusto', 'potente'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari', 'Rum'], w: 3 },
  { words: ['leve', 'suave', 'fraco', 'delicado', 'baixo teor', 'menos alcool', 'pouco alcool'], difficulty: 'Fácil', w: 2 },
  { words: ['spirit forward', 'puro', 'sem mistura', 'sem suco'], bases: ['Whisky', 'Bourbon', 'Gin', 'Campari'], w: 3 },
  { words: ['refrescante', 'fresquinho', 'gelado', 'calor', 'verao', 'verão', 'quente', 'frescor', 'churrasco', 'churras', 'piscina', 'praia', 'tarde de sol'], tags: ['calor'], w: 3 },
  { words: ['aconchegante', 'frio', 'inverno', 'quentinho', 'aquece', 'friozinho', 'cobertor'], tags: ['frio'], w: 3 },
  { words: ['romantico', 'romântico', 'date', 'namorado', 'namorada', 'jantar', 'especial', 'sofisticado', 'elegante', 'chique', 'impressionar', 'surpreender', 'conquista'], tags: ['date'], w: 3 },
  { words: ['festa', 'festas', 'comemoracao', 'comemoração', 'celebracao', 'celebração', 'animado', 'balada', 'aniversario', 'aniversário', 'galera', 'turma', 'amigos', 'grupo'], tags: ['festas'], w: 3 },
  { words: ['sozinho', 'sozinha', 'so eu', 'só eu', 'relaxar', 'relaxando', 'tranquilo', 'sossego', 'descanso', 'serie', 'netflix', 'em casa', 'fim de dia'], tags: ['solo'], w: 3 },
  { words: ['ressaca', 'cansado', 'cansada', 'de leve hoje', 'nao exagerar', 'não exagerar'], tags: ['solo'], difficulty: 'Fácil', w: 3 },
  { words: ['rapido', 'rapida', 'pratico', 'pratica', 'simples de fazer', 'sem trabalho', 'sem muito preparo', 'iniciante', 'nunca fiz', 'primeira vez', 'comecando'], difficulty: 'Fácil', w: 3 },
  { words: ['sem coqueteleira', 'sem shaker', 'sem equipamento', 'so com copo', 'sem utensilios'], method: 'built', w: 4 },
  { words: ['mexido', 'so mexer', 'no copo', 'on the rocks', 'stirred'], method: 'stirred', w: 3 },
  { words: ['classico', 'clássico', 'tradicional', 'atemporal', 'icone', 'ícone'], tags: ['classico'], w: 2 },
  { words: ['brasileiro', 'brasileira', 'brasil', 'nacional', 'cachaca', 'cachaça'], tags: ['brasil'], w: 4 },
  { words: ['italiano', 'italia', 'aperitivo', 'aperitif'], family: 'negroni', w: 3 },
  { words: ['tropical', 'caribenho', 'caribe'], family: 'tropical', w: 3 },
  { words: ['popular', 'famoso', 'mais pedido', 'mais conhecido', 'todo mundo conhece'], tags: ['popular'], w: 2 },
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
  { words: ['negroni'], family: 'negroni', bases: ['Campari', 'Gin', 'Vermute'], w: 5 },
  { words: ['boulevardier'], family: 'negroni', bases: ['Bourbon', 'Campari'], w: 5 },
  { words: ['americano'], family: 'negroni', bases: ['Campari', 'Vermute'], w: 5 },
  { words: ['caipirinha'], family: 'caipirinha', tags: ['brasil'], w: 5 },
  { words: ['mojito'], family: 'collins', bases: ['Rum'], tags: ['calor'], w: 5 },
  { words: ['margarita'], family: 'sour', bases: ['Tequila'], w: 5 },
  { words: ['spritz', 'aperol spritz'], family: 'spritz', bases: ['Aperol'], w: 5 },
  { words: ['manhattan'], family: 'bourbon_stirred', bases: ['Bourbon'], w: 5 },
  { words: ['old fashioned'], family: 'bourbon_stirred', bases: ['Bourbon'], w: 5 },
  { words: ['daiquiri'], family: 'sour', bases: ['Rum'], w: 5 },
  { words: ['martini'], family: 'martini', bases: ['Gin', 'Vodka'], w: 5 },
  { words: ['cosmopolitan', 'cosmo'], family: 'martini', bases: ['Vodka'], w: 5 },
  { words: ['espresso martini'], family: 'cafe', bases: ['Vodka'], w: 5 },
  { words: ['whisky sour'], family: 'sour', bases: ['Whisky'], w: 5 },
  { words: ['pisco sour'], family: 'sour', bases: ['Pisco'], w: 5 },
  { words: ['pina colada', 'piña colada'], family: 'tropical', bases: ['Rum'], w: 5 },
  { words: ['gin tonica', 'gin tônica', 'gin and tonic'], family: 'collins', bases: ['Gin'], w: 5 },
  { words: ['rabo de galo'], family: 'negroni', tags: ['brasil'], w: 5 },
  { words: ['penicillin'], bases: ['Whisky'], w: 5 },
  { words: ['french 75'], family: 'spritz', bases: ['Gin'], w: 5 },
  { words: ['new york sour'], family: 'bourbon_stirred', bases: ['Bourbon'], w: 5 },
  { words: ['moscow mule', 'moscow'], family: 'collins', bases: ['Vodka'], w: 5 },
  { words: ['mai tai'], family: 'tropical', bases: ['Rum'], w: 5 },
  { words: ['bee knees', 'bees knees'], family: 'sour', bases: ['Gin'], w: 5 },
  { words: ['fitzgerald'], family: 'sour', bases: ['Gin'], w: 5 },
  { words: ['whisky', 'whiskey', 'escoces', 'escocês', 'scotch'], bases: ['Whisky'], w: 4 },
  { words: ['bourbon'], bases: ['Bourbon'], w: 4 },
  { words: ['gin'], bases: ['Gin'], w: 4 },
  { words: ['vodka'], bases: ['Vodka'], w: 4 },
  { words: ['rum', 'rhum'], bases: ['Rum'], w: 4 },
  { words: ['tequila', 'mezcal'], bases: ['Tequila'], w: 4 },
  { words: ['aperol'], bases: ['Aperol'], w: 4 },
  { words: ['campari'], bases: ['Campari'], w: 4 },
  { words: ['vermute', 'vermouth'], bases: ['Vermute'], w: 4 },
  { words: ['pisco'], bases: ['Pisco'], w: 4 },
  { words: ['cachaca', 'cachaça'], bases: ['Cachaça'], w: 4 },
];

const NEGATION_PATTERNS = [
  /\bsem\s+(?:ser\s+)?(esse|isso|aquele|este)?\s*(\w+(?:\s+\w+)?)/g,
  /\bn[aã]o\s+(?:quero|gosto\s+(?:de|do|da)|gosta\s+(?:de|do|da)|curto|seja|gostam\s+(?:de|do|da))\s+(\w+(?:(?:\s+\w+){0,2})?)/g,
  /\bn[aã]o\s+(?:quero|gosto|gosta)\s+(?:de|do|da|um|uma)\s+(\w+(?:\s+\w+)?)/g,
  /\bnada\s+de\s+(\w+(?:\s+\w+)?)/g,
  /\bevitar?\s+(\w+(?:\s+\w+)?)/g,
  /\bdetesto\s+(\w+(?:\s+\w+)?)/g,
  /\bodeio\s+(\w+(?:\s+\w+)?)/g,
  /\bmuito\s+(\w+)\s+(?:pro|pra|para|demais)/g,
  /\b(\w+)\s+demais\b/g,
];

const INGREDIENT_WORDS = {
  'rum': ['rum'], 'rhum': ['rum'], 'gin': ['gin'], 'vodka': ['vodka'],
  'tequila': ['tequila'], 'mezcal': ['tequila'], 'cachaca': ['cachaca'],
  'cachaça': ['cachaca'], 'whisky': ['whisky'], 'whiskey': ['whisky'],
  'scotch': ['whisky'], 'bourbon': ['bourbon'], 'campari': ['campari'],
  'aperol': ['aperol'], 'vermute': ['vermute'], 'vermouth': ['vermute'],
  'limao': ['limao_taiti', 'limao_siciliano'], 'laranja': ['laranja', 'sumo_laranja'],
  'hortela': ['hortela'], 'hortelã': ['hortela'], 'menta': ['hortela'],
  'gengibre': ['gengibre'], 'cafe': ['cafe'], 'espresso': ['cafe'],
  'coco': ['creme_coco', 'leite_coco'], 'maracuja': ['maracuja', 'xarope_maracuja'],
  'morango': ['morango', 'xarope_morango'], 'framboesa': ['xarope_framboesa'],
  'mel': ['mel', 'xarope_mel'], 'prosecco': ['prosecco'], 'angostura': ['angostura'],
};

const POPULAR_FALLBACK = [5, 15, 2, 16, 17, 8, 14, 33, 3, 7];

// ─── ENGINE ──────────────────────────────────────────────────────────────────

function normalizeText(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function abvNumber(drink) {
  return parseInt(drink.abv?.replace('%', '') || '0', 10);
}

function detectSimilarTo(normalized) {
  const patterns = [
    /parecido com (.+)/, /parecida com (.+)/, /tipo (.+)/, /estilo (.+)/,
    /como o (.+)/, /como a (.+)/, /como um (.+)/, /como uma (.+)/,
    /inspirado (?:no|na|em) (.+)/, /no estilo (?:do|da|de)? ?(.+)/,
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
      // Last capture group is the actual negated term
      const captured = match[match.length - 1];
      if (captured) terms.add(normalizeText(captured.trim()));
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

// ─── ZÉ AMARGO — geração de resposta ─────────────────────────────────────────

function zeResponse(top, activeRules, similarFamilies, negatedRules, userBar, context) {
  const { history = [], ratings = {} } = context;
  const allTags  = activeRules.flatMap(r => r.tags  || []);
  const allBases = activeRules.flatMap(r => r.bases || []);
  const allFams  = [...new Set([
    ...activeRules.filter(r => r.family).map(r => r.family),
    ...similarFamilies,
  ])];

  // Checa se o usuário tem os ingredientes pra fazer o top[0] agora
  const canMakeFirst = top.length > 0 && userBar.length > 0 &&
    (top[0].needs || []).length > 0 &&
    (top[0].needs || []).every(n => userBar.includes(n));

  // Checa se usuário já fez o drink antes
  const alreadyMade = top.length > 0 && history.some(h => h.id === top[0].id);
  const alreadyRated = top.length > 0 && ratings[top[0].id] > 0;

  if (top.length === 0) {
    return 'Hm. Não peguei direito o que você tá buscando. Fala mais — pra que ocasião é? Tem alguma base preferida ou algo que tem em casa?';
  }

  const d0 = top[0];
  const d1 = top[1];
  const extra = canMakeFirst ? ' Você tem os ingredientes — pode fazer agora.' : '';
  const familiar = alreadyMade
    ? (alreadyRated ? ` Você já fez e avaliou bem — acho que sabe o que esperar.` : ` Você já fez antes. Às vezes voltar pro clássico é a resposta certa.`)
    : '';

  // Similar to
  if (similarFamilies.length > 0) {
    const fam = similarFamilies[0];
    const famDesc = FAMILIES[fam]?.desc || 'esse estilo';
    const others = top.slice(1).map(d => d.name).join(' ou ');
    return `Se você curte ${famDesc}, vai gostar de ${d0.name} — ${d0.subtitle}.${familiar}${extra}${others ? ` Também pode ir de ${others}.` : ''}`;
  }

  // Calor/refrescante
  if (allTags.includes('calor')) {
    return `Com esse calor, sem pensar muito: ${d0.name}. ${d0.subtitle}.${extra}${d1 ? ` Se quiser variar, ${d1.name} também resolve.` : ''}`;
  }

  // Frio/aconchegante
  if (allTags.includes('frio')) {
    return `Pra esse friozinho, ${d0.name} é meu palpite. ${d0.subtitle}. Feito direito, é aconchegante de verdade.${extra}`;
  }

  // Date/especial
  if (allTags.includes('date')) {
    return `Pra impressionar? ${d0.name}. Não é óbvio, mas também não é complicado. A pessoa vai notar que você se preparou.${extra}${d1 ? ` ${d1.name} é outra pedida segura.` : ''}`;
  }

  // Festa/grupo
  if (allTags.includes('festas')) {
    return `Pra animar a galera, ${d0.name} é certeiro — todo mundo gosta e dá pra fazer em quantidade.${d1 ? ` ${d1.name} também funciona bem em batelada.` : ''}`;
  }

  // Solo/relaxar
  if (allTags.includes('solo')) {
    return `Fim de dia, só você? ${d0.name}. ${d0.subtitle}. Sem pressa, desse jeito.${extra}`;
  }

  // Brasil/cachaça
  if (allTags.includes('brasil') || allBases.includes('Cachaça')) {
    return `Cachaça é o que o Brasil tem de melhor, sem discussão. ${d0.name} é a pedida — ${d0.subtitle}.${familiar}${extra}`;
  }

  // Café
  if (allFams.includes('cafe')) {
    return `Café no drink? Minha pedida é ${d0.name}. ${d0.subtitle}. É o tipo de coisa que você faz e quer de novo.${extra}`;
  }

  // Negroni/amargo
  if (allFams.includes('negroni') || allBases.some(b => ['Campari', 'Aperol'].includes(b))) {
    return `${d0.name} — ${d0.subtitle}. Não é pra todo mundo, mas quem gosta não larga.${familiar}${extra}`;
  }

  // Bourbon/whisky clássico
  if (allFams.includes('bourbon_stirred') || allBases.some(b => ['Whisky', 'Bourbon'].includes(b))) {
    return `Quer intensidade? ${d0.name}. ${d0.subtitle}. Mexido, não batido — esse é o detalhe.${extra}`;
  }

  // Spritz/borbulhante
  if (allFams.includes('spritz')) {
    return `Algo leve e borbulhante? ${d0.name} é perfeito pra isso. ${d0.subtitle}.${d1 ? ` Ou ${d1.name} se quiser variar.` : ''}${extra}`;
  }

  // Gin/botânico
  if (allBases.includes('Gin')) {
    return `Gin tem uma complexidade que poucos destilados têm. ${d0.name} é onde eu ia pra você — ${d0.subtitle}.${extra}`;
  }

  // Rum/tropical
  if (allBases.includes('Rum') || allFams.includes('tropical')) {
    return `Rum é charme caribenho puro. ${d0.name} — ${d0.subtitle}.${extra}${d1 ? ` ${d1.name} também é boa pedida.` : ''}`;
  }

  // Can make right now
  if (canMakeFirst) {
    return `Com o que você tem aí, ${d0.name} é a escolha certa. ${d0.subtitle}. Você tem os ingredientes, só falta fazer.`;
  }

  // Generic
  return `Pelo que você descreveu, ia de ${d0.name}. ${d0.subtitle}. ${d1 ? `${d1.name} também é forte candidato.` : ''} Se não convenceu, me fala o que não tá certo.`;
}

function localRecommend(input, userBar = [], drinks = [], context = {}, excludeIds = []) {
  const normalized = normalizeText(input);

  const similarFamilies      = detectSimilarTo(normalized);
  const negatedTerms         = extractNegatedTerms(normalized);
  const mentionedIngredients = extractIngredientNeeds(normalized);

  const activeRules = RULES.filter(rule =>
    rule.words.some(w => normalized.includes(normalizeText(w))) &&
    !rule.words.some(w => negatedTerms.some(neg =>
      normalizeText(w).includes(neg) || neg.includes(normalizeText(w))
    ))
  );

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

    if (activeFamilyIds.has(drink.id)) score += 4;
    for (const fam of similarFamilies) {
      if (FAMILIES[fam]?.ids.includes(drink.id)) score += 5;
    }
    for (const rule of activeRules) {
      if (rule.tags)       score += rule.tags.filter(t => drink.tags.includes(t)).length * rule.w;
      if (rule.bases && rule.bases.includes(drink.base)) score += rule.w;
      if (rule.difficulty && drink.difficulty === rule.difficulty) score += rule.w;
      if (rule.method && drink.method === rule.method) score += rule.w;
    }
    for (const rule of negatedRules) {
      if (rule.bases && rule.bases.includes(drink.base)) score -= rule.w * 2;
      if (rule.tags) score -= rule.tags.filter(t => drink.tags.includes(t)).length * rule.w * 2;
      if (rule.family && FAMILIES[rule.family]?.ids.includes(drink.id)) score -= 4;
    }
    if (mentionedIngredients.length > 0) {
      const drinkNeeds = drink.needs || [];
      score += mentionedIngredients.filter(n => drinkNeeds.includes(n)).length * 2;
    }
    if (userBar.length > 0) {
      const drinkNeeds = drink.needs || [];
      if (drinkNeeds.length > 0) {
        const hasAll  = drinkNeeds.every(n => userBar.includes(n));
        const hasSome = drinkNeeds.some(n => userBar.includes(n));
        if (hasAll)       score += 3;
        else if (hasSome) score += 1;
      }
    }
    if (wantsStrong) score += Math.max(0, drinkAbv - 18) * 0.4;
    if (wantsLight)  score += Math.max(0, 16 - drinkAbv) * 0.4;

    return { drink, score };
  });

  const top = scored
    .filter(s => s.score > 0 && !excludeIds.includes(s.drink.id))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(s => s.drink);

  if (top.length === 0) {
    const fallback = [...POPULAR_FALLBACK]
      .filter(id => !excludeIds.includes(id))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(id => drinks.find(d => d.id === id))
      .filter(Boolean);
    return {
      text: excludeIds.length > 0
        ? 'Mudando de rota então. Aqui tem outras pedidas que funcionam:'
        : 'Não reconheci um estilo específico, mas raramente erro com esses clássicos:',
      drinks: fallback,
    };
  }

  const text = zeResponse(top, activeRules, similarFamilies, negatedRules, userBar, context);
  return { text, drinks: top };
}

// ─── ABERTURA CONTEXTUALIZADA ─────────────────────────────────────────────────

function buildOpening(firstName, history, streak, ingredients) {
  const hoje = new Date();
  const recentCount = history.filter(h => (hoje - new Date(h.date)) / 86400000 <= 7).length;

  if (streak.current >= 7) {
    return `${firstName}, ${streak.current} dias seguidos é coisa séria. Respeito. O que vamos preparar hoje?`;
  }
  if (recentCount >= 3) {
    return `${recentCount} drinks essa semana — tá no ritmo. Qual é a do dia?`;
  }
  if (recentCount === 1) {
    return `Vi que você fez um drink essa semana. Gostou? Me fala o que tá na cabeça hoje.`;
  }
  if (ingredients.length >= 8) {
    return `Você tem um bar decente aí — ${ingredients.length} ingredientes. Dá pra fazer bastante coisa. O que tá com vontade?`;
  }
  if (history.length === 0) {
    return `Primeira vez no balcão? Bem-vindo. Me conta o que você tá afim de tomar.`;
  }
  return `${firstName}. Pode falar, o balcão é seu.`;
}

// ─── SUGESTÕES DE INÍCIO ──────────────────────────────────────────────────────

const STARTERS = [
  'Calor aqui, quero algo refrescante',
  'Tenho cachaça e limão em casa',
  'Algo parecido com Negroni mas diferente',
  'Pra impressionar numa janta',
];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function BartenderIAScreen({ navigation }) {
  const { favorites, toggleFavorite, ingredients: userBar, ratings, history, streak } = useApp();
  const { user } = useAuth();
  const drinks = useDrinks();
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);

  const firstName = user?.user_metadata?.name?.split(' ')[0] || 'amigo';
  const context   = { history, ratings };

  useEffect(() => {
    const opening = buildOpening(firstName, history, streak, userBar);
    setMessages([{ role: 'ze', text: opening, drinks: [] }]);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (_) {}

    // Snapshot before state update so the timeout closure captures current state
    const snapshot = messages;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    scrollToBottom();

    setTimeout(() => {
      // Cumulative context: all user turns + current message
      const allUserText = [
        ...snapshot.filter(m => m.role === 'user').map(m => m.text),
        msg,
      ].join(' ');

      // IDs of every drink already shown in this conversation
      const shownIds = snapshot
        .filter(m => m.role === 'ze')
        .flatMap(m => m.drinks || [])
        .map(d => d.id);

      // Detect "give me a different one" requests
      const norm = normalizeText(msg);
      const isAltRequest = /\b(outro|outra|diferente|sem ser (esse|isso|aquele)|nao (pode ser|quero|seja) esse|muda|troca|algo diferente|pode ser outro|outra opcao|outra sugestao)\b/.test(norm);

      const excludeIds = isAltRequest ? shownIds : [];

      const { text: zeText, drinks: zeDrinks } = localRecommend(allUserText, userBar, drinks, context, excludeIds);
      setMessages(prev => [...prev, { role: 'ze', text: zeText, drinks: zeDrinks }]);
      setTyping(false);
      scrollToBottom();
    }, 700);
  };

  const isFirstMessage = messages.length <= 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.zeAvatar}>
            <Text style={styles.zeAvatarText}>ZA</Text>
          </View>
          <View>
            <Text style={styles.headerName}>Zé Amargo</Text>
            <Text style={styles.headerSub}>Bartender pessoal</Text>
          </View>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((msg, i) => {
            if (msg.role === 'user') {
              return (
                <View key={i} style={styles.userRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{msg.text}</Text>
                  </View>
                </View>
              );
            }

            // Zé's message
            return (
              <View key={i} style={styles.zeRow}>
                <View style={styles.zeAvatarSmall}>
                  <Text style={styles.zeAvatarSmallText}>ZA</Text>
                </View>
                <View style={{ flex: 1, gap: 10 }}>
                  <View style={styles.zeBubble}>
                    <Text style={styles.zeText}>{msg.text}</Text>
                  </View>
                  {(msg.drinks || []).map(drink => (
                    <DrinkCardList
                      key={drink.id}
                      drink={drink}
                      isFavorite={favorites.includes(drink.id)}
                      onPress={() => navigation.navigate('DrinkDetail', { drinkId: drink.id })}
                      onFavorite={() => toggleFavorite(drink.id)}
                      rating={ratings[drink.id]}
                    />
                  ))}
                  {/* Quick-start chips only after opening message */}
                  {i === 0 && isFirstMessage && (
                    <View style={styles.starters}>
                      {STARTERS.map(s => (
                        <TouchableOpacity
                          key={s}
                          onPress={() => handleSend(s)}
                          activeOpacity={0.8}
                          style={styles.starterChip}
                        >
                          <Text style={styles.starterText}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {typing && (
            <View style={styles.zeRow}>
              <View style={styles.zeAvatarSmall}>
                <Text style={styles.zeAvatarSmallText}>ZA</Text>
              </View>
              <View style={styles.typingBubble}>
                <Text style={styles.typingDots}>• • •</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* INPUT */}
        <View style={styles.inputRow}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Fala aí..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            style={styles.input}
            multiline
            maxLength={200}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!input.trim()}
            activeOpacity={0.8}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────

const ZE_BG   = '#1C1A14';   // fundo escuro — bar à noite
const BUBBLE_ZE = '#2A2720'; // balão do Zé — um tom acima do fundo
const GOLD    = '#FFD966';
const GOLD_DIM = '#B8860B';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ZE_BG },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: radius.sm,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 22, color: '#fff', lineHeight: 24 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerName: { fontSize: 15, fontFamily: fonts.extraBold, color: '#fff' },
  headerSub:  { fontSize: 11, fontFamily: fonts.semiBold, color: 'rgba(255,255,255,0.4)', marginTop: 1 },

  // Avatar Zé — header
  zeAvatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: GOLD_DIM,
    alignItems: 'center', justifyContent: 'center',
  },
  zeAvatarText: { fontSize: 13, fontFamily: fonts.black, color: ZE_BG, letterSpacing: -0.5 },

  // Chat
  chat:        { flex: 1 },
  chatContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 16, gap: 16 },

  // Zé row
  zeRow:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  zeAvatarSmall: {
    width: 30, height: 30, borderRadius: 9, backgroundColor: GOLD_DIM,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2,
  },
  zeAvatarSmallText: { fontSize: 10, fontFamily: fonts.black, color: ZE_BG, letterSpacing: -0.5 },
  zeBubble: {
    backgroundColor: BUBBLE_ZE, borderRadius: radius.lg,
    borderTopLeftRadius: 4,
    padding: 14, alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  zeText: { fontSize: 14, fontFamily: fonts.semiBold, color: 'rgba(255,255,255,0.88)', lineHeight: 21 },

  // User row
  userRow:   { flexDirection: 'row', justifyContent: 'flex-end' },
  userBubble: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    borderTopRightRadius: 4,
    padding: 14, maxWidth: '78%',
  },
  userText: { fontSize: 14, fontFamily: fonts.semiBold, color: '#fff', lineHeight: 20 },

  // Typing
  typingBubble: {
    backgroundColor: BUBBLE_ZE, borderRadius: radius.lg, borderTopLeftRadius: 4,
    paddingHorizontal: 18, paddingVertical: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  typingDots: { fontSize: 16, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 },

  // Quick-start chips
  starters:    { gap: 8, marginTop: 4 },
  starterChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  starterText: { fontSize: 13, fontFamily: fonts.semiBold, color: 'rgba(255,255,255,0.65)' },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: spacing.lg, paddingVertical: 12,
    backgroundColor: '#242018',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1, fontSize: 14, fontFamily: fonts.semiBold,
    color: '#fff', maxHeight: 80, paddingTop: 4,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.3 },
  sendIcon: { fontSize: 18, color: ZE_BG, fontFamily: fonts.black, lineHeight: 22 },
});
