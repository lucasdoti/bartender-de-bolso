import { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fonts, radius, spacing } from '../theme';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '🍸',
    title: 'Seu bartender\nno bolso',
    sub: 'Explore mais de 50 drinks clássicos e modernos com receitas detalhadas.',
    gradient: ['#0D1B2A', '#1A3A5C'],
    accent: '#5BA4CF',
  },
  {
    emoji: '🥃',
    title: 'Monte seu bar\nem casa',
    sub: 'Diga o que você tem e descubra tudo que pode preparar agora.',
    gradient: ['#1C1A14', '#3D3420'],
    accent: '#FFD966',
  },
  {
    emoji: '🎲',
    title: 'Surpreenda-se\ncada dia',
    sub: 'Use o "Surpreenda-me" para descobrir o drink perfeito com o que você tem em casa.',
    gradient: ['#1A0D0D', '#3A1515'],
    accent: '#E85D42',
  },
  {
    emoji: '💬',
    title: 'Fale com o\nBartender',
    sub: 'Descreva o que você quer — forte, refrescante, parecido com Negroni — e receba a sugestão certa.',
    gradient: ['#120D24', '#2D1854'],
    accent: '#9B6FD4',
  },
];

export default function OnboardingScreen({ onDone }) {
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef(null);

  const goTo = (index) => {
    Haptics.selectionAsync();
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrent(index);
  };

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    if (idx !== current) setCurrent(idx);
  };

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('onboarding_done', 'true');
    onDone();
  };

  const isLast = current === slides.length - 1;

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {slides.map((slide, i) => (
          <LinearGradient
            key={i}
            colors={slide.gradient}
            style={styles.slide}
          >
            <SafeAreaView style={styles.safeSlide} edges={['top', 'bottom']}>
              <View style={styles.slideContent}>
                <View style={[styles.emojiCircle, { borderColor: slide.accent + '44', backgroundColor: slide.accent + '18' }]}>
                  <Text style={styles.emoji}>{slide.emoji}</Text>
                </View>

                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.sub}>{slide.sub}</Text>
              </View>

              {/* DOTS */}
              <View style={styles.dots}>
                {slides.map((_, di) => (
                  <View
                    key={di}
                    style={[
                      styles.dot,
                      di === i
                        ? [styles.dotActive, { backgroundColor: slide.accent }]
                        : styles.dotInactive,
                    ]}
                  />
                ))}
              </View>

              {/* BUTTONS */}
              <View style={styles.btnRow}>
                {!isLast && (
                  <TouchableOpacity onPress={finish} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Pular</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => isLast ? finish() : goTo(i + 1)}
                  activeOpacity={0.85}
                  style={[styles.nextBtn, { backgroundColor: slide.accent }]}
                >
                  <Text style={styles.nextText}>{isLast ? 'Começar' : 'Próximo'}</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  slide: { width, flex: 1 },
  safeSlide: { flex: 1, paddingHorizontal: spacing.xl },
  slideContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },

  emojiCircle: {
    width: 120,
    height: 120,
    borderRadius: 36,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emoji: { fontSize: 56 },

  title: {
    fontSize: 36,
    fontFamily: fonts.displayBold,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 42,
  },
  sub: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { height: 6, borderRadius: 3 },
  dotActive: { width: 24 },
  dotInactive: { width: 6, backgroundColor: 'rgba(255,255,255,0.25)' },

  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 8,
  },
  skipBtn: { paddingVertical: 14, paddingHorizontal: 16 },
  skipText: { fontSize: 14, fontFamily: fonts.extraBold, color: 'rgba(255,255,255,0.45)' },
  nextBtn: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#fff' },
});
