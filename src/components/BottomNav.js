import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';

const tabs = [
  { id: 'Home',       emoji: '🏠', label: 'Início'    },
  { id: 'Cardapio',   emoji: '📖', label: 'Cardápio'  },
  { id: 'MeuBar',     emoji: '🥃', label: 'Meu Bar'   },
  { id: 'Favoritos',  emoji: '❤️', label: 'Favoritos' },
  { id: 'Perfil',     emoji: '👤', label: 'Perfil'    },
];

export default function BottomNav({ active, navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => navigation.navigate(tab.id)}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.emoji, { fontSize: isActive ? 17 : 20 }]}>
              {tab.emoji}
            </Text>
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
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: colors.dark,
  },
  emoji: {
    lineHeight: 24,
  },
  label: {
    fontSize: 10,
    fontFamily: fonts.extraBold,
    color: colors.textLight,
  },
  labelActive: {
    color: '#fff',
  },
});
