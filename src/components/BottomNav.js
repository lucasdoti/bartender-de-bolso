import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, fonts } from '../theme';

const tabs = [
  { id: 'Home',      icon: 'home',    label: 'Início'    },
  { id: 'Cardapio',  icon: 'book',    label: 'Cardápio'  },
  { id: 'MeuBar',    icon: 'wine',    label: 'Meu Bar'   },
  { id: 'Favoritos', icon: 'heart',   label: 'Favoritos' },
  { id: 'Perfil',    icon: 'person',  label: 'Perfil'    },
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
            onPress={() => {
              if (!isActive) Haptics.selectionAsync();
              navigation.navigate('Tabs', { screen: tab.id });
            }}
            style={[styles.tab, isActive && styles.tabActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.icon : `${tab.icon}-outline`}
              size={20}
              color={isActive ? '#fff' : colors.textLight}
            />
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
