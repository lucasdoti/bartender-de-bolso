import Svg, { Rect, Path, Ellipse, Line, Circle } from 'react-native-svg';

// ════════════════════════════════════════════════
// 36 copos únicos — Bartender de Bolso
// ════════════════════════════════════════════════

// 1 — Mojito (highball, hortelã, canudo)
const G1 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="22" y="10" width="36" height="52" rx="8" fill="#C8F0D0" stroke="#2E7D32" strokeWidth="2"/>
    <Rect x="22" y="10" width="36" height="18" rx="8" fill="#A5D6A7" opacity="0.6"/>
    <Rect x="50" y="6" width="4" height="38" rx="2" fill="#FF8A65"/>
    <Ellipse cx="34" cy="20" rx="8" ry="4" fill="#388E3C" transform="rotate(-20, 34, 20)"/>
    <Ellipse cx="42" cy="17" rx="7" ry="3.5" fill="#43A047" transform="rotate(15, 42, 17)"/>
    <Circle cx="36" cy="30" r="6" fill="#AED581" stroke="#7CB342" strokeWidth="1.2"/>
    <Rect x="30" y="62" width="20" height="5" rx="2.5" fill="#2E7D32"/>
  </Svg>
);

// 2 — Daiquiri (taça coupe, vermelho)
const G2 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M16 18 Q16 40 40 44 Q64 40 64 18 Z" fill="#FFCDD2" stroke="#C62828" strokeWidth="2"/>
    <Path d="M16 18 Q16 30 40 33 Q64 30 64 18 Z" fill="#EF9A9A" opacity="0.6"/>
    <Path d="M16 18 Q40 12 64 18" stroke="#E57373" strokeWidth="1.5" opacity="0.5"/>
    <Line x1="40" y1="44" x2="40" y2="64" stroke="#C62828" strokeWidth="3"/>
    <Ellipse cx="40" cy="66" rx="14" ry="4" fill="#C62828"/>
    <Path d="M58 16 L64 12 L62 20 Z" fill="#4CAF50"/>
  </Svg>
);

// 3 — Piña Colada (hurricane, abacaxi)
const G3 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M28 12 Q20 40 22 62 L58 62 Q60 40 52 12 Z" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2"/>
    <Path d="M28 12 Q22 30 23 45 L57 45 Q58 30 52 12 Z" fill="#FFEE58" opacity="0.4"/>
    <Rect x="44" y="6" width="4" height="42" rx="2" fill="#FF8A65"/>
    <Path d="M30 14 L34 4 L38 14 Z" fill="#66BB6A"/>
    <Path d="M36 14 L40 2 L44 14 Z" fill="#4CAF50"/>
    <Path d="M42 14 L46 5 L50 14 Z" fill="#66BB6A"/>
    <Circle cx="50" cy="20" r="5" fill="#FDD835" stroke="#F9A825" strokeWidth="1"/>
    <Rect x="30" y="62" width="20" height="5" rx="2.5" fill="#F9A825"/>
  </Svg>
);

// 4 — Cuba Libre (highball, cola, limão)
const G4 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="22" y="10" width="36" height="52" rx="6" fill="#D7A86E" stroke="#BF360C" strokeWidth="2"/>
    <Rect x="22" y="10" width="36" height="16" rx="6" fill="#8D5524" opacity="0.5"/>
    <Rect x="26" y="44" width="11" height="11" rx="3" fill="white" opacity="0.5" stroke="#ddd" strokeWidth="1"/>
    <Path d="M42 30 L52 30 L47 22 Z" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1"/>
    <Rect x="50" y="6" width="4" height="38" rx="2" fill="#212121"/>
    <Rect x="30" y="62" width="20" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

// 5 — Negroni (rocks, gelo, laranja)
const G5 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M18 20 L22 65 L58 65 L62 20 Z" fill="#FFCCBC" stroke="#E64A19" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 20 L22 38 L58 38 L62 20 Z" fill="#FF7043" opacity="0.5"/>
    <Rect x="26" y="42" width="12" height="12" rx="3" fill="white" opacity="0.7" stroke="#ddd" strokeWidth="1"/>
    <Rect x="42" y="45" width="11" height="11" rx="3" fill="white" opacity="0.6" stroke="#ddd" strokeWidth="1"/>
    <Path d="M50 25 Q60 18 65 28" stroke="#FF6D00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <Circle cx="65" cy="28" r="3" fill="#FF6D00"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

// 6 — Gin Tônica (taça balão, bolhas, pepino)
const G6 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 24 Q20 50 40 54 Q60 50 60 24 Z" fill="#E3F2FD" stroke="#1565C0" strokeWidth="2"/>
    <Path d="M20 24 Q20 38 40 41 Q60 38 60 24 Z" fill="#BBDEFB" opacity="0.6"/>
    <Circle cx="32" cy="42" r="2.5" fill="white" opacity="0.6"/>
    <Circle cx="46" cy="46" r="2" fill="white" opacity="0.5"/>
    <Circle cx="38" cy="48" r="1.5" fill="white" opacity="0.5"/>
    <Ellipse cx="48" cy="30" rx="5" ry="3" fill="#A5D6A7" stroke="#66BB6A" strokeWidth="1" transform="rotate(30, 48, 30)"/>
    <Line x1="40" y1="54" x2="40" y2="66" stroke="#1565C0" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="13" ry="3.5" fill="#1565C0"/>
  </Svg>
);

// 7 — Tom Collins (copo alto, limão)
const G7 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="26" y="8" width="28" height="56" rx="5" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2"/>
    <Rect x="26" y="8" width="28" height="20" rx="5" fill="#FFEE58" opacity="0.5"/>
    <Circle cx="32" cy="40" r="2" fill="white" opacity="0.6"/>
    <Circle cx="44" cy="48" r="1.8" fill="white" opacity="0.5"/>
    <Circle cx="48" cy="22" r="6" fill="#FDD835" stroke="#F9A825" strokeWidth="1.2"/>
    <Rect x="46" y="4" width="3" height="30" rx="1.5" fill="#FF8A65"/>
    <Rect x="32" y="64" width="16" height="5" rx="2.5" fill="#F9A825"/>
  </Svg>
);

// 8 — Martini (taça martini, azeitona)
const G8 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M14 16 L40 48 L66 16 Z" fill="#E8EAF6" stroke="#1565C0" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M14 16 L40 34 L66 16 Z" fill="#C5CAE9" opacity="0.6"/>
    <Line x1="40" y1="48" x2="40" y2="66" stroke="#1565C0" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#1565C0"/>
    <Line x1="46" y1="14" x2="40" y2="30" stroke="#8D6E63" strokeWidth="1"/>
    <Circle cx="46" cy="13" r="4" fill="#7CB342" stroke="#558B2F" strokeWidth="1"/>
    <Circle cx="46" cy="13" r="1.5" fill="#C62828"/>
  </Svg>
);

// 9 — Cosmopolitan (martini, rosa, laranja)
const G9 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M14 16 L40 48 L66 16 Z" fill="#FCE4EC" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M14 16 L40 34 L66 16 Z" fill="#F8BBD0" opacity="0.7"/>
    <Line x1="40" y1="48" x2="40" y2="66" stroke="#C2185B" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#C2185B"/>
    <Path d="M56 14 Q64 12 62 20" stroke="#FF6D00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </Svg>
);

// 10 — Moscow Mule (caneca cobre, limão)
const G10 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="18" y="16" width="40" height="50" rx="5" fill="#E8C9A0" stroke="#A1685A" strokeWidth="2"/>
    <Rect x="18" y="16" width="40" height="50" rx="5" fill="#D7A86E" opacity="0.4"/>
    <Ellipse cx="38" cy="16" rx="20" ry="5" fill="#C89B6C" opacity="0.8"/>
    <Path d="M58 28 Q70 30 70 44 Q70 54 60 54" stroke="#A1685A" strokeWidth="3" fill="none"/>
    <Circle cx="34" cy="30" r="5" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1.2"/>
    <Rect x="48" y="10" width="4" height="20" rx="2" fill="#FF8A65"/>
    <Rect x="24" y="66" width="28" height="4" rx="2" fill="#8D5524"/>
  </Svg>
);

// 11 — Bloody Mary (highball, salsão, vermelho)
const G11 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="14" width="32" height="50" rx="5" fill="#E57373" stroke="#C62828" strokeWidth="2"/>
    <Rect x="24" y="14" width="32" height="16" rx="5" fill="#EF5350" opacity="0.6"/>
    <Rect x="44" y="6" width="4" height="40" rx="2" fill="#FF8A65"/>
    <Rect x="34" y="4" width="5" height="36" rx="2" fill="#7CB342"/>
    <Path d="M34 4 Q30 0 36 2" stroke="#558B2F" strokeWidth="2" fill="none"/>
    <Circle cx="50" cy="22" r="5" fill="#FDD835" stroke="#F9A825" strokeWidth="1"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#C62828"/>
  </Svg>
);

// 12 — Margarita (taça margarita, sal, limão)
const G12 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M15 18 L40 52 L65 18 Z" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M15 18 L40 36 L65 18 Z" fill="#FFEE58" opacity="0.5"/>
    <Path d="M15 18 Q40 10 65 18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3"/>
    <Circle cx="62" cy="22" r="8" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1.5"/>
    <Circle cx="62" cy="22" r="4" fill="#E6EE9C"/>
    <Line x1="40" y1="52" x2="40" y2="68" stroke="#F9A825" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#F9A825"/>
  </Svg>
);

// 13 — Tequila Sunrise (highball, degradê)
const G13 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M24 12 Q18 40 20 64 L60 64 Q62 40 56 12 Z" fill="#FFECB3" stroke="#F57F17" strokeWidth="2"/>
    <Path d="M24 12 Q20 30 21 48 L59 48 Q60 30 56 12 Z" fill="#FF7043" opacity="0.4"/>
    <Path d="M24 12 Q22 22 22 32 L58 32 Q58 22 56 12 Z" fill="#FFCA28" opacity="0.5"/>
    <Circle cx="50" cy="56" r="5" fill="#E53935" opacity="0.7"/>
    <Rect x="46" y="6" width="4" height="42" rx="2" fill="#FF8A65"/>
    <Circle cx="48" cy="6" r="5" fill="#FF4444" stroke="#FFB300" strokeWidth="1.5"/>
    <Rect x="28" y="64" width="24" height="5" rx="2.5" fill="#F57F17"/>
  </Svg>
);

// 14 — Old Fashioned (rocks, gelo grande, cereja)
const G14 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M16 22 L20 66 L60 66 L64 22 Z" fill="#FFE0B2" stroke="#BF360C" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M16 22 L20 42 L60 42 L64 22 Z" fill="#FFAB40" opacity="0.5"/>
    <Rect x="24" y="45" width="18" height="16" rx="4" fill="white" opacity="0.75" stroke="#ddd" strokeWidth="1.2"/>
    <Circle cx="38" cy="28" r="4" fill="#C62828"/>
    <Path d="M38 24 Q44 18 48 22" stroke="#388E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <Rect x="26" y="66" width="28" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

// 15 — Whisky Sour (rocks, espuma, cereja)
const G15 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M18 24 L22 65 L58 65 L62 24 Z" fill="#FFE0B2" stroke="#E65100" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 24 L20 32 L60 32 L62 24 Z" fill="#FFF3E0" opacity="0.9"/>
    <Ellipse cx="40" cy="24" rx="22" ry="4" fill="#FFF8E1"/>
    <Rect x="26" y="44" width="13" height="13" rx="3" fill="white" opacity="0.6" stroke="#ddd" strokeWidth="1"/>
    <Circle cx="48" cy="20" r="3.5" fill="#C62828"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#E65100"/>
  </Svg>
);

// 16 — Aperol Spritz (taça vinho, laranja, bolhas)
const G16 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M24 14 Q24 50 40 56 Q56 50 56 14 Z" fill="#FFCCBC" stroke="#E64A19" strokeWidth="2"/>
    <Path d="M24 14 Q24 32 40 36 Q56 32 56 14 Z" fill="#FF7043" opacity="0.4"/>
    <Circle cx="34" cy="45" r="2" fill="white" opacity="0.7"/>
    <Circle cx="42" cy="40" r="1.5" fill="white" opacity="0.6"/>
    <Circle cx="54" cy="16" r="7" fill="#FF6D00" stroke="#E65100" strokeWidth="1.2"/>
    <Circle cx="54" cy="16" r="3.5" fill="#FFB74D"/>
    <Line x1="40" y1="56" x2="40" y2="68" stroke="#E64A19" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="12" ry="3.5" fill="#E64A19"/>
  </Svg>
);

// 17 — Caipirinha (tumbler, limão verde)
const G17 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 18 L24 65 L56 65 L60 18 Z" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M20 18 L24 38 L56 38 L60 18 Z" fill="#A5D6A7" opacity="0.5"/>
    <Path d="M28 26 L36 26 L32 18 Z" fill="#8BC34A" stroke="#558B2F" strokeWidth="1"/>
    <Path d="M36 26 L44 26 L40 18 Z" fill="#AED581" stroke="#558B2F" strokeWidth="1"/>
    <Path d="M44 26 L52 26 L48 18 Z" fill="#8BC34A" stroke="#558B2F" strokeWidth="1"/>
    <Rect x="50" y="10" width="4" height="36" rx="2" fill="#FFCC02"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#1B5E20"/>
  </Svg>
);

// 18 — Batida de Coco (copo, coco ralado, creme)
const G18 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M22 18 L26 64 L54 64 L58 18 Z" fill="#FFF8E1" stroke="#F57F17" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M22 18 L24 30 L56 30 L58 18 Z" fill="white" opacity="0.7"/>
    <Ellipse cx="40" cy="18" rx="18" ry="4" fill="white"/>
    <Circle cx="32" cy="16" r="1" fill="#E0E0E0"/>
    <Circle cx="40" cy="15" r="1" fill="#E0E0E0"/>
    <Circle cx="46" cy="17" r="1" fill="#E0E0E0"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#F57F17"/>
  </Svg>
);

// 19 — Espresso Martini (martini, grãos de café)
const G19 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M14 16 L40 48 L66 16 Z" fill="#5D4037" stroke="#3E2723" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M14 16 L40 26 L66 16 Z" fill="#D7CCC8" opacity="0.7"/>
    <Ellipse cx="34" cy="18" rx="3" ry="2" fill="#3E2723"/>
    <Ellipse cx="42" cy="18" rx="3" ry="2" fill="#3E2723"/>
    <Ellipse cx="38" cy="21" rx="3" ry="2" fill="#3E2723"/>
    <Line x1="40" y1="48" x2="40" y2="66" stroke="#3E2723" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#3E2723"/>
  </Svg>
);

// 20 — Caipiroska (tumbler, limão, vodka cristalina)
const G20 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 18 L24 65 L56 65 L60 18 Z" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M20 18 L24 38 L56 38 L60 18 Z" fill="#C8E6C9" opacity="0.5"/>
    <Path d="M30 28 L38 28 L34 20 Z" fill="#AED581" stroke="#558B2F" strokeWidth="1"/>
    <Path d="M40 28 L48 28 L44 20 Z" fill="#C5E1A5" stroke="#558B2F" strokeWidth="1"/>
    <Rect x="28" y="44" width="10" height="10" rx="2" fill="white" opacity="0.6" stroke="#ddd" strokeWidth="1"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#1B5E20"/>
  </Svg>
);

// 21 — Sex on the Beach (highball, degradê rosa)
const G21 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="12" width="32" height="52" rx="5" fill="#FFCDD2" stroke="#C2185B" strokeWidth="2"/>
    <Rect x="24" y="12" width="32" height="24" rx="5" fill="#FFAB91" opacity="0.6"/>
    <Path d="M24 40 L56 40 L56 64 L24 64 Z" fill="#F48FB1" opacity="0.4"/>
    <Rect x="48" y="6" width="4" height="40" rx="2" fill="#FF8A65"/>
    <Circle cx="50" cy="20" r="5" fill="#FF7043" stroke="#E64A19" strokeWidth="1"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#C2185B"/>
  </Svg>
);

// 22 — Mai Tai (rocks tiki, hortelã, abacaxi)
const G22 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M18 24 L22 65 L58 65 L62 24 Z" fill="#FFE0B2" stroke="#F57F17" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 24 L20 40 L60 40 L62 24 Z" fill="#FFB74D" opacity="0.5"/>
    <Rect x="26" y="44" width="11" height="11" rx="3" fill="white" opacity="0.6" stroke="#ddd" strokeWidth="1"/>
    <Ellipse cx="34" cy="22" rx="7" ry="4" fill="#388E3C" transform="rotate(-15, 34, 22)"/>
    <Ellipse cx="42" cy="19" rx="6" ry="3" fill="#43A047" transform="rotate(15, 42, 19)"/>
    <Circle cx="50" cy="24" r="5" fill="#FDD835" stroke="#F9A825" strokeWidth="1"/>
    <Rect x="48" y="6" width="3" height="20" rx="1.5" fill="#FF8A65"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#F57F17"/>
  </Svg>
);

// 23 — Piña Verde (highball verde, hortelã)
const G23 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="12" width="32" height="52" rx="6" fill="#DCEDC8" stroke="#2E7D32" strokeWidth="2"/>
    <Rect x="24" y="12" width="32" height="20" rx="6" fill="#AED581" opacity="0.6"/>
    <Ellipse cx="34" cy="22" rx="7" ry="4" fill="#388E3C" transform="rotate(-15, 34, 22)"/>
    <Ellipse cx="44" cy="19" rx="6" ry="3" fill="#43A047" transform="rotate(15, 44, 19)"/>
    <Rect x="48" y="6" width="4" height="40" rx="2" fill="#FFCC02"/>
    <Circle cx="34" cy="44" r="2" fill="white" opacity="0.5"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#1B5E20"/>
  </Svg>
);

// 24 — Clericot (taça vinho, frutas, roxo)
const G24 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M22 16 Q22 48 40 54 Q58 48 58 16 Z" fill="#E1BEE7" stroke="#7B1FA2" strokeWidth="2"/>
    <Path d="M22 16 Q22 36 40 40 Q58 36 58 16 Z" fill="#CE93D8" opacity="0.6"/>
    <Circle cx="34" cy="34" r="4" fill="#E53935"/>
    <Circle cx="44" cy="38" r="3.5" fill="#43A047"/>
    <Circle cx="40" cy="28" r="3" fill="#FB8C00"/>
    <Line x1="40" y1="54" x2="40" y2="66" stroke="#7B1FA2" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="13" ry="3.5" fill="#7B1FA2"/>
  </Svg>
);

// 25 — Margarita Frozen (taça frozen, granizado)
const G25 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M15 18 L40 52 L65 18 Z" fill="#DCEDC8" stroke="#2E7D32" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M15 18 Q40 8 65 18 Q52 30 40 48 Q28 30 15 18 Z" fill="#C5E1A5" opacity="0.7"/>
    <Path d="M15 18 Q40 10 65 18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3"/>
    <Circle cx="30" cy="24" r="1.5" fill="white" opacity="0.8"/>
    <Circle cx="48" cy="26" r="1.5" fill="white" opacity="0.7"/>
    <Circle cx="40" cy="32" r="1.5" fill="white" opacity="0.6"/>
    <Circle cx="60" cy="22" r="6" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1.2"/>
    <Line x1="40" y1="52" x2="40" y2="68" stroke="#2E7D32" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#2E7D32"/>
  </Svg>
);

// 26 — Paloma (highball, toranja, rosa)
const G26 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="12" width="32" height="52" rx="5" fill="#F8BBD0" stroke="#C2185B" strokeWidth="2"/>
    <Rect x="24" y="12" width="32" height="20" rx="5" fill="#F48FB1" opacity="0.6"/>
    <Path d="M24 12 Q40 6 56 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 2"/>
    <Circle cx="50" cy="24" r="6" fill="#EF9A9A" stroke="#E57373" strokeWidth="1.2"/>
    <Circle cx="50" cy="24" r="3" fill="#FFCDD2"/>
    <Circle cx="34" cy="46" r="2" fill="white" opacity="0.5"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#C2185B"/>
  </Svg>
);

// 27 — Gin Fizz (copo alto, espuma, bolhas)
const G27 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="26" y="12" width="28" height="52" rx="5" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2"/>
    <Rect x="26" y="12" width="28" height="12" rx="5" fill="white" opacity="0.85"/>
    <Ellipse cx="40" cy="13" rx="14" ry="3" fill="#FFFDE7"/>
    <Circle cx="33" cy="40" r="2" fill="white" opacity="0.6"/>
    <Circle cx="46" cy="48" r="1.8" fill="white" opacity="0.5"/>
    <Circle cx="38" cy="54" r="1.5" fill="white" opacity="0.4"/>
    <Rect x="32" y="64" width="16" height="5" rx="2.5" fill="#F9A825"/>
  </Svg>
);

// 28 — Clover Club (coupe, espuma, framboesa)
const G28 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M16 20 Q16 42 40 46 Q64 42 64 20 Z" fill="#F8BBD0" stroke="#C2185B" strokeWidth="2"/>
    <Path d="M16 20 Q40 14 64 20" stroke="#FCE4EC" strokeWidth="3" strokeLinecap="round"/>
    <Circle cx="36" cy="17" r="3" fill="#AD1457"/>
    <Circle cx="43" cy="17" r="3" fill="#C2185B"/>
    <Line x1="40" y1="46" x2="40" y2="66" stroke="#C2185B" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#C2185B"/>
  </Svg>
);

// 29 — Negroni Sbagliato (rocks, bolhas, laranja)
const G29 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M18 20 L22 65 L58 65 L62 20 Z" fill="#FFCCBC" stroke="#E64A19" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 20 L22 38 L58 38 L62 20 Z" fill="#FF7043" opacity="0.5"/>
    <Circle cx="32" cy="46" r="2" fill="white" opacity="0.6"/>
    <Circle cx="44" cy="52" r="1.8" fill="white" opacity="0.5"/>
    <Circle cx="38" cy="56" r="1.5" fill="white" opacity="0.4"/>
    <Path d="M50 25 Q60 18 65 28" stroke="#FF6D00" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <Circle cx="65" cy="28" r="3" fill="#FF6D00"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

// 30 — Mimosa (taça flute, laranja)
const G30 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M32 10 L34 50 L46 50 L48 10 Z" fill="#FFE082" stroke="#F57F17" strokeWidth="2"/>
    <Path d="M32 10 L33 28 L47 28 L48 10 Z" fill="#FFCA28" opacity="0.5"/>
    <Circle cx="38" cy="22" r="1.3" fill="white" opacity="0.7"/>
    <Circle cx="42" cy="34" r="1.2" fill="white" opacity="0.6"/>
    <Circle cx="39" cy="42" r="1" fill="white" opacity="0.5"/>
    <Line x1="40" y1="50" x2="40" y2="68" stroke="#F57F17" strokeWidth="2.5"/>
    <Ellipse cx="40" cy="70" rx="11" ry="3" fill="#F57F17"/>
  </Svg>
);

// 31 — Dark n Stormy (highball, tempestade escura)
const G31 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="12" width="32" height="52" rx="5" fill="#FFE0B2" stroke="#BF360C" strokeWidth="2"/>
    <Path d="M24 12 L56 12 L56 34 Q40 28 24 36 Z" fill="#6D4C41" opacity="0.7"/>
    <Path d="M24 32 Q40 26 56 34 L56 40 Q40 34 24 42 Z" fill="#8D6E63" opacity="0.5"/>
    <Circle cx="34" cy="50" r="2" fill="white" opacity="0.4"/>
    <Circle cx="46" cy="46" r="1.8" fill="white" opacity="0.4"/>
    <Path d="M44 28 L52 28 L48 20 Z" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

// 32 — Caipirinha de Morango (tumbler, morango)
const G32 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 18 L24 65 L56 65 L60 18 Z" fill="#FCE4EC" stroke="#C2185B" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M20 18 L24 38 L56 38 L60 18 Z" fill="#F48FB1" opacity="0.5"/>
    <Path d="M34 24 Q30 20 34 18 Q38 20 42 18 Q40 24 37 28 Q34 26 34 24 Z" fill="#E53935"/>
    <Path d="M42 30 Q38 26 42 24 Q46 26 50 24 Q48 30 45 34 Q42 32 42 30 Z" fill="#EF5350"/>
    <Rect x="48" y="10" width="4" height="36" rx="2" fill="#66BB6A"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#AD1457"/>
  </Svg>
);

// 33 — Americano (rocks, bolhas, laranja, vermelho)
const G33 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M18 22 L22 65 L58 65 L62 22 Z" fill="#FFCDD2" stroke="#C62828" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M18 22 L22 40 L58 40 L62 22 Z" fill="#EF9A9A" opacity="0.5"/>
    <Circle cx="32" cy="48" r="2" fill="white" opacity="0.6"/>
    <Circle cx="44" cy="52" r="1.8" fill="white" opacity="0.5"/>
    <Circle cx="50" cy="26" r="6" fill="#FF7043" stroke="#E64A19" strokeWidth="1.2"/>
    <Line x1="50" y1="20" x2="50" y2="32" stroke="#E64A19" strokeWidth="0.8"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#C62828"/>
  </Svg>
);

// 34 — Sea Breeze (highball, rosa, limão)
const G34 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="24" y="12" width="32" height="52" rx="5" fill="#F8BBD0" stroke="#C2185B" strokeWidth="2"/>
    <Rect x="24" y="12" width="32" height="22" rx="5" fill="#EF9A9A" opacity="0.5"/>
    <Path d="M24 38 L56 38 L56 64 L24 64 Z" fill="#F48FB1" opacity="0.4"/>
    <Circle cx="50" cy="22" r="5" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1"/>
    <Rect x="48" y="6" width="4" height="36" rx="2" fill="#FF8A65"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#C2185B"/>
  </Svg>
);

// 35 — Mint Julep (copo prata, muita hortelã)
const G35 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M22 20 L26 64 L54 64 L58 20 Z" fill="#CFD8DC" stroke="#607D8B" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M22 20 L24 40 L56 40 L58 20 Z" fill="#B0BEC5" opacity="0.5"/>
    <Ellipse cx="32" cy="14" rx="8" ry="5" fill="#388E3C" transform="rotate(-20, 32, 14)"/>
    <Ellipse cx="42" cy="10" rx="8" ry="5" fill="#43A047" transform="rotate(10, 42, 10)"/>
    <Ellipse cx="48" cy="16" rx="7" ry="4" fill="#2E7D32" transform="rotate(25, 48, 16)"/>
    <Rect x="30" y="64" width="20" height="5" rx="2.5" fill="#455A64"/>
  </Svg>
);

// 36 — Caipirinha de Maracujá (tumbler, maracujá)
const G36 = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 18 L24 65 L56 65 L60 18 Z" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M20 18 L24 38 L56 38 L60 18 Z" fill="#FFE082" opacity="0.6"/>
    <Circle cx="34" cy="30" r="1.2" fill="#5D4037"/>
    <Circle cx="40" cy="34" r="1.2" fill="#5D4037"/>
    <Circle cx="46" cy="30" r="1.2" fill="#5D4037"/>
    <Circle cx="38" cy="28" r="1.2" fill="#5D4037"/>
    <Circle cx="44" cy="35" r="1.2" fill="#5D4037"/>
    <Path d="M30 24 L38 24 L34 18 Z" fill="#AED581" stroke="#558B2F" strokeWidth="1"/>
    <Rect x="50" y="10" width="4" height="36" rx="2" fill="#FFCC02"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#F57F17"/>
  </Svg>
);

export const glassMap = {
  1: G1,   2: G2,   3: G3,   4: G4,   5: G5,   6: G6,
  7: G7,   8: G8,   9: G9,   10: G10, 11: G11, 12: G12,
  13: G13, 14: G14, 15: G15, 16: G16, 17: G17, 18: G18,
  19: G19, 20: G20, 21: G21, 22: G22, 23: G23, 24: G24,
  25: G25, 26: G26, 27: G27, 28: G28, 29: G29, 30: G30,
  31: G31, 32: G32, 33: G33, 34: G34, 35: G35, 36: G36,
};

export default glassMap;
