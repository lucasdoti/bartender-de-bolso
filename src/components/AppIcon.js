import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path, Line, Circle } from 'react-native-svg';

export default function AppIcon({ size = 46 }) {
  const r = Math.round(size * 0.24);
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: r,
      backgroundColor: '#1C1A14',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <Svg width={size * 0.62} height={size * 0.68} viewBox="0 0 110 120" fill="none">
        <Defs>
          <LinearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#FFD966"/>
            <Stop offset="100%" stopColor="#B8860B"/>
          </LinearGradient>
          <LinearGradient id="il" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#C84B31"/>
            <Stop offset="100%" stopColor="#7B1F0A"/>
          </LinearGradient>
          <LinearGradient id="is" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#B8860B"/>
            <Stop offset="50%" stopColor="#FFD966"/>
            <Stop offset="100%" stopColor="#B8860B"/>
          </LinearGradient>
        </Defs>
        <Path d="M14 18 L55 70 L96 18" stroke="url(#ig)" strokeWidth="2.5" strokeLinejoin="round" fill="none" strokeLinecap="round"/>
        <Path d="M14 18 L55 50 L96 18 Z" fill="url(#il)" opacity="0.9"/>
        <Path d="M20 20 L40 34" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round"/>
        <Line x1="55" y1="70" x2="55" y2="100" stroke="url(#is)" strokeWidth="2.5" strokeLinecap="round"/>
        <Path d="M34 100 Q55 96 76 100" stroke="url(#ig)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <Line x1="42" y1="10" x2="62" y2="32" stroke="#FFD966" strokeWidth="1.5" strokeLinecap="round"/>
        <Circle cx="42" cy="10" r="6" fill="#C84B31" stroke="#FFD966" strokeWidth="1.5"/>
        <Circle cx="42" cy="10" r="2" fill="#FFD966"/>
        <Circle cx="88" cy="28" r="1.5" fill="#FFD966" opacity="0.7"/>
        <Circle cx="20" cy="38" r="1" fill="#FFD966" opacity="0.5"/>
      </Svg>
    </View>
  );
}
