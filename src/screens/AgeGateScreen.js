import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fonts, radius, spacing } from '../theme';

export default function AgeGateScreen({ onConfirm }) {
  const [denied, setDenied] = useState(false);

  const confirm = async () => {
    await AsyncStorage.setItem('age_confirmed', 'true');
    onConfirm();
  };

  if (denied) {
    return (
      <LinearGradient colors={['#1C1A14', '#0D0D0D']} style={{ flex: 1 }}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.content}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🔞</Text>
            <Text style={styles.title}>Acesso restrito</Text>
            <Text style={styles.sub}>
              O Bartender de Bolso é um aplicativo de bebidas alcoólicas.{'\n\n'}
              É necessário ter 18 anos ou mais para continuar.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1C1A14', '#0D0D0D']} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={{ fontSize: 52, marginBottom: 10 }}>🍸</Text>
          <Text style={styles.brand}>Bartender de Bolso</Text>
          <Text style={styles.title}>Conteúdo para maiores de 18 anos</Text>
          <Text style={styles.sub}>
            Este app envolve bebidas alcoólicas.{'\n'}
            Confirme sua idade para continuar.
          </Text>

          <View style={styles.btnGroup}>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirm} activeOpacity={0.85}>
              <Text style={styles.confirmText}>Tenho 18 anos ou mais ✓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.denyBtn} onPress={() => setDenied(true)} activeOpacity={0.85}>
              <Text style={styles.denyText}>Não tenho 18 anos</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.legal}>🚗 Beba com moderação. Não beba e dirija.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.xl,
  },
  brand: {
    fontSize: 12, fontFamily: fonts.extraBold,
    color: 'rgba(255,255,255,0.35)', letterSpacing: 2,
    textTransform: 'uppercase', marginBottom: 24,
  },
  title: {
    fontSize: 22, fontFamily: fonts.displayBold, color: '#fff',
    textAlign: 'center', lineHeight: 30, marginBottom: 14,
  },
  sub: {
    fontSize: 14, fontFamily: fonts.semiBold,
    color: 'rgba(255,255,255,0.45)', textAlign: 'center',
    lineHeight: 22, marginBottom: 44,
  },
  btnGroup: { width: '100%', gap: 12 },
  confirmBtn: {
    backgroundColor: '#FFD966', borderRadius: radius.lg,
    paddingVertical: 16, alignItems: 'center',
  },
  confirmText: { fontSize: 16, fontFamily: fonts.extraBold, color: '#1C1A14' },
  denyBtn: { paddingVertical: 14, alignItems: 'center' },
  denyText: { fontSize: 14, fontFamily: fonts.semiBold, color: 'rgba(255,255,255,0.28)' },
  legal: {
    fontSize: 11, fontFamily: fonts.semiBold,
    color: 'rgba(255,255,255,0.2)', marginTop: 36, textAlign: 'center',
  },
});
