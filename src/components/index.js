import Svg, { Rect, Path, Ellipse, Line, Circle } from 'react-native-svg';

export const MojitoGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Rect x="22" y="10" width="36" height="52" rx="8" fill="#C8F0D0" stroke="#2E7D32" strokeWidth="2"/>
    <Rect x="22" y="10" width="36" height="18" rx="8" fill="#A5D6A7" opacity="0.6"/>
    <Ellipse cx="40" cy="10" rx="18" ry="5" fill="#81C784" opacity="0.7"/>
    <Rect x="50" y="6" width="4" height="38" rx="2" fill="#FF8A65"/>
    <Ellipse cx="34" cy="20" rx="8" ry="4" fill="#388E3C" transform="rotate(-20, 34, 20)"/>
    <Ellipse cx="42" cy="17" rx="7" ry="3.5" fill="#43A047" transform="rotate(15, 42, 17)"/>
    <Circle cx="36" cy="28" r="6" fill="#AED581" stroke="#7CB342" strokeWidth="1.2"/>
    <Line x1="36" y1="22" x2="36" y2="34" stroke="#7CB342" strokeWidth="0.8"/>
    <Line x1="30" y1="28" x2="42" y2="28" stroke="#7CB342" strokeWidth="0.8"/>
    <Rect x="30" y="62" width="20" height="5" rx="2.5" fill="#2E7D32"/>
  </Svg>
);

export const NegroniGlass = ({ size = 48 }) => (
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

export const MargaritaGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M15 18 L40 52 L65 18 Z" fill="#FFF9C4" stroke="#F9A825" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M15 18 L40 36 L65 18 Z" fill="#FFEE58" opacity="0.5"/>
    <Path d="M15 18 Q40 10 65 18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 3"/>
    <Circle cx="62" cy="22" r="8" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1.5"/>
    <Circle cx="62" cy="22" r="4" fill="#E6EE9C"/>
    <Line x1="62" y1="14" x2="62" y2="30" stroke="#8BC34A" strokeWidth="0.8"/>
    <Line x1="54" y1="22" x2="70" y2="22" stroke="#8BC34A" strokeWidth="0.8"/>
    <Line x1="40" y1="52" x2="40" y2="68" stroke="#F9A825" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="14" ry="4" fill="#F9A825"/>
  </Svg>
);

export const OldFashionedGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M16 22 L20 66 L60 66 L64 22 Z" fill="#FFE0B2" stroke="#BF360C" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M16 22 L20 42 L60 42 L64 22 Z" fill="#FFAB40" opacity="0.5"/>
    <Rect x="24" y="45" width="18" height="16" rx="4" fill="white" opacity="0.75" stroke="#ddd" strokeWidth="1.2"/>
    <Circle cx="38" cy="28" r="4" fill="#C62828"/>
    <Path d="M38 24 Q44 18 48 22" stroke="#388E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <Rect x="26" y="66" width="28" height="5" rx="2.5" fill="#BF360C"/>
  </Svg>
);

export const AperolGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M24 14 Q24 50 40 56 Q56 50 56 14 Z" fill="#FFCCBC" stroke="#E64A19" strokeWidth="2"/>
    <Path d="M24 14 Q24 32 40 36 Q56 32 56 14 Z" fill="#FF7043" opacity="0.4"/>
    <Circle cx="34" cy="45" r="2" fill="white" opacity="0.7"/>
    <Circle cx="42" cy="40" r="1.5" fill="white" opacity="0.6"/>
    <Circle cx="54" cy="16" r="7" fill="#FF6D00" stroke="#E65100" strokeWidth="1.2"/>
    <Circle cx="54" cy="16" r="3.5" fill="#FFB74D"/>
    <Line x1="54" y1="9" x2="54" y2="23" stroke="#E65100" strokeWidth="0.8"/>
    <Line x1="47" y1="16" x2="61" y2="16" stroke="#E65100" strokeWidth="0.8"/>
    <Line x1="40" y1="56" x2="40" y2="68" stroke="#E64A19" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="12" ry="3.5" fill="#E64A19"/>
  </Svg>
);

export const CaipirinhaGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M20 18 L24 65 L56 65 L60 18 Z" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M20 18 L24 38 L56 38 L60 18 Z" fill="#A5D6A7" opacity="0.5"/>
    <Rect x="26" y="42" width="9" height="9" rx="2" fill="white" opacity="0.8" transform="rotate(15, 30, 46)"/>
    <Rect x="38" y="44" width="8" height="8" rx="2" fill="white" opacity="0.7" transform="rotate(-10, 42, 48)"/>
    <Path d="M28 26 L36 26 L32 18 Z" fill="#8BC34A" stroke="#558B2F" strokeWidth="1"/>
    <Path d="M36 26 L44 26 L40 18 Z" fill="#AED581" stroke="#558B2F" strokeWidth="1"/>
    <Path d="M44 26 L52 26 L48 18 Z" fill="#8BC34A" stroke="#558B2F" strokeWidth="1"/>
    <Rect x="50" y="10" width="4" height="36" rx="2" fill="#FFCC02"/>
    <Rect x="28" y="65" width="24" height="5" rx="2.5" fill="#1B5E20"/>
  </Svg>
);

export const CosmopolitanGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M12 14 L40 52 L68 14 Z" fill="#FFCDD2" stroke="#C62828" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M12 14 L40 34 L68 14 Z" fill="#EF9A9A" opacity="0.6"/>
    <Line x1="40" y1="52" x2="40" y2="68" stroke="#C62828" strokeWidth="3"/>
    <Ellipse cx="40" cy="68" rx="13" ry="3.5" fill="#C62828"/>
    <Circle cx="64" cy="18" r="6" fill="#FF8A65" stroke="#E64A19" strokeWidth="1.2"/>
  </Svg>
);

export const WhiskySourGlass = ({ size = 48 }) => (
  <Svg viewBox="0 0 80 80" width={size} height={size} fill="none">
    <Path d="M16 18 L20 65 L60 65 L64 18 Z" fill="#FFE0B2" stroke="#E65100" strokeWidth="2" strokeLinejoin="round"/>
    <Path d="M16 18 L20 38 L60 38 L64 18 Z" fill="#FFAB40" opacity="0.6"/>
    <Rect x="24" y="44" width="14" height="14" rx="4" fill="white" opacity="0.7" stroke="#ddd" strokeWidth="1"/>
    <Circle cx="52" cy="26" r="5" fill="#CDDC39" stroke="#8BC34A" strokeWidth="1.2"/>
    <Rect x="26" y="65" width="28" height="5" rx="2.5" fill="#E65100"/>
  </Svg>
);

// Mapa para usar pelo id do drink
export const glassMap = {
  1: MojitoGlass,
  2: NegroniGlass,
  3: MargaritaGlass,
  4: OldFashionedGlass,
  5: AperolGlass,
  6: CaipirinhaGlass,
  7: CosmopolitanGlass,
  8: WhiskySourGlass,
};

export default glassMap;
