import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';

import {
  PlayfairDisplay_700Bold,
  PlayfairDisplay_600BoldItalic,
} from '@expo-google-fonts/playfair-display';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AgeGateScreen from './src/screens/AgeGateScreen';
import OfflineBanner from './src/components/OfflineBanner';

const Loader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' }}>
    <ActivityIndicator size="large" color="#C84B31" />
  </View>
);

function Root() {
  const { session, loading } = useAuth();
  const [ageConfirmed,    setAgeConfirmed]    = useState(null);
  const [onboardingDone,  setOnboardingDone]  = useState(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('age_confirmed'),
      AsyncStorage.getItem('onboarding_done'),
    ]).then(([age, onb]) => {
      setAgeConfirmed(!!age);
      setOnboardingDone(!!onb);
    });
  }, []);

  if (loading || ageConfirmed === null || onboardingDone === null) return <Loader />;

  if (!ageConfirmed) {
    return <AgeGateScreen onConfirm={() => setAgeConfirmed(true)} />;
  }

  if (!onboardingDone) {
    return <OnboardingScreen onDone={() => setOnboardingDone(true)} />;
  }

  return session ? (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  ) : (
    <AuthScreen />
  );
}

// Trava orientação portrait na versão web
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.screen?.orientation?.lock?.('portrait').catch(() => {});
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_600BoldItalic,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAF8' }}>
        <ActivityIndicator size="large" color="#C84B31" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="dark" backgroundColor="#FAFAF8" />
          <Root />
          <OfflineBanner />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
