import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme';
import { useApp } from '../context/AppContext';

const tabs = [
  { id: 'Home',      icon: 'home',    label: 'Início',    premium: false },
  { id: 'Cardapio',  icon: 'book',    label: 'Cardápio',  premium: false },
  { id: 'MeuBar',    icon: 'wine',    label: 'Meu Bar',   premium: true  },
  { id: 'Favoritos', icon: 'heart',   label: 'Favoritos', premium: true  },
  { id: 'Perfil',    icon: 'person',  label: 'Perfil',    premium: false },
];

export default function BottomNav({ active, navigation }) {
  const insets = useSafeAreaInsets();
  const { isPremium } = useApp();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        const locked = tab.premium && !isPremium;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => {
              Haptics.selectionAsync();
              if (locked) {
                navigation.navigate('Paywall');
              } else {
                navigation.navigate('Tabs', { screen: tab.id });
              }
            }}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <View>
              <Ionicons
                name={isActive ? tab.icon : `${tab.icon}-outline`}
                size={20}
                color={isActive ? '#fff' : colors.textLight}
              />
              {locked && (
                <View style={styles.lockBadge}>
                  <Ionicons name="lock-closed" size={8} color="#fff" />
                </View>
              )}
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250,250,248,0.97)',
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 56,
  },
  lockBadge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: '#9B6FD4',
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.dark,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
    color: colors.textLight,
    marginTop: 3,
  },
  labelActive: {
    color: '#fff',
  },
});
