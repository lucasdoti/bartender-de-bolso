import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { fonts } from '../theme';

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    setIsOnline(navigator.onLine);
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>📶  Sem conexão — verifique sua internet</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C1A14',
    paddingVertical: 10,
    paddingHorizontal: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  text: { fontSize: 12, fontFamily: fonts.bold, color: '#FFD966' },
});
