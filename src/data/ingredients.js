import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

const LimaoTaitiIcon = ({ size = 22 }) => (
  <Svg viewBox="0 0 40 40" width={size} height={size} fill="none">
    <Circle cx="20" cy="20" r="15" fill="#8BC34A" stroke="#558B2F" strokeWidth="1.5"/>
    <Circle cx="20" cy="20" r="10" fill="#AED581" opacity="0.45"/>
    <Path d="M20 5 Q23 12 20 20 Q17 12 20 5" fill="#7CB342" opacity="0.5"/>
    <Path d="M35 20 Q28 23 20 20 Q28 17 35 20" fill="#7CB342" opacity="0.5"/>
    <Path d="M5 20 Q12 23 20 20 Q12 17 5 20" fill="#7CB342" opacity="0.5"/>
    <Path d="M20 35 Q23 28 20 20 Q17 28 20 35" fill="#7CB342" opacity="0.5"/>
    <Path d="M16 7 Q13 3 15 1" stroke="#558B2F" strokeWidth="1.5" strokeLinecap="round"/>
  </Svg>
);

const LimaoSicilianoIcon = ({ size = 22 }) => (
  <Svg viewBox="0 0 48 36" width={size} height={size * 0.75} fill="none">
    <Ellipse cx="24" cy="18" rx="18" ry="13" fill="#FDD835" stroke="#F9A825" strokeWidth="1.5"/>
    <Ellipse cx="24" cy="18" rx="18" ry="13" fill="#FFEE58" opacity="0.4"/>
    <Path d="M6 18 Q15 22 24 18 Q15 14 6 18" fill="#F9A825" opacity="0.35"/>
    <Path d="M42 18 Q33 22 24 18 Q33 14 42 18" fill="#F9A825" opacity="0.35"/>
    <Path d="M40 13 Q45 10 43 6" stroke="#F9A825" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M8 23 Q3 26 5 30" stroke="#F9A825" strokeWidth="2" strokeLinecap="round"/>
    <Circle cx="18" cy="14" r="1.5" fill="#F9A825" opacity="0.5"/>
    <Circle cx="28" cy="16" r="1.5" fill="#F9A825" opacity="0.5"/>
    <Circle cx="22" cy="22" r="1.5" fill="#F9A825" opacity="0.5"/>
  </Svg>
);

export const ingredientCategories = [
  {
    cat: 'Destilados',
    emoji: '🥃',
    items: [
      { id: 'rum',       label: 'Rum',        emoji: '🍬' },
      { id: 'vodka',     label: 'Vodka',      emoji: '🧊' },
      { id: 'gin',       label: 'Gin',        emoji: '🌿' },
      { id: 'tequila',   label: 'Tequila',    emoji: '🌵' },
      { id: 'cachaca',   label: 'Cachaça',    emoji: '🇧🇷' },
      { id: 'whisky',    label: 'Whisky',     emoji: '🥃' },
      { id: 'bourbon',   label: 'Bourbon',    emoji: '🍯' },
      { id: 'campari',   label: 'Campari',    emoji: '🍊' },
      { id: 'aperol',    label: 'Aperol',     emoji: '🍑' },
      { id: 'vermute',   label: 'Vermute',    emoji: '🍷' },
      { id: 'triplesec', label: 'Triple Sec', emoji: '🍋' },
      { id: 'pisco',     label: 'Pisco',      emoji: '🏺' },
    ],
  },
  {
    cat: 'Frutas & Ervas',
    emoji: '🍋',
    items: [
      { id: 'limao_taiti',     label: 'Limão Taiti',     SvgIcon: LimaoTaitiIcon },
      { id: 'limao_siciliano', label: 'Limão Siciliano', SvgIcon: LimaoSicilianoIcon },
      { id: 'laranja',    label: 'Laranja',    emoji: '🍊' },
      { id: 'maca',       label: 'Maçã',       emoji: '🍎' },
      { id: 'maracuja',   label: 'Maracujá',   emoji: '🌟' },
      { id: 'morango',    label: 'Morango',    emoji: '🍓' },
      { id: 'hortela',    label: 'Hortelã',    emoji: '🌿' },
      { id: 'gengibre',   label: 'Gengibre',   emoji: '🫚' },
      { id: 'manjericao', label: 'Manjericão', emoji: '🌱' },
    ],
  },
  {
    cat: 'Complementos',
    emoji: '🧃',
    items: [
      { id: 'agua_gas',    label: 'Água com gás',    emoji: '💧' },
      { id: 'prosecco',    label: 'Prosecco',        emoji: '🍾' },
      { id: 'sumo_laranja',label: 'Suco de laranja', emoji: '🍊' },
      { id: 'creme_coco',  label: 'Creme de coco',   emoji: '🥥' },
      { id: 'leite_coco',  label: 'Leite de coco',   emoji: '🥥' },
      { id: 'angostura',   label: 'Angostura',       emoji: '🍶' },
      { id: 'mel',         label: 'Mel',             emoji: '🍯' },
      { id: 'cafe',        label: 'Café',            emoji: '☕' },
      { id: 'acucar',      label: 'Açúcar',          emoji: '🍬' },
      { id: 'gelo',        label: 'Gelo',            emoji: '🧊' },
    ],
  },
];

export default ingredientCategories;
