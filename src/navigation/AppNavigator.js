import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen        from '../screens/HomeScreen';
import CardapioScreen    from '../screens/CardapioScreen';
import DrinkDetailScreen from '../screens/DrinkDetailScreen';
import MeuBarScreen      from '../screens/MeuBarScreen';
import FavoritosScreen   from '../screens/FavoritosScreen';
import PerfilScreen      from '../screens/PerfilScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain"    component={HomeScreen} />
      <Stack.Screen name="DrinkDetail" component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
}

function CardapioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CardapioList" component={CardapioScreen} />
      <Stack.Screen name="DrinkDetail"  component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
}

function FavoritosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritosList" component={FavoritosScreen} />
      <Stack.Screen name="DrinkDetail"   component={DrinkDetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      >
        <Tab.Screen name="Home"       component={HomeStack} />
        <Tab.Screen name="Cardapio"   component={CardapioStack} />
        <Tab.Screen name="MeuBar"     component={MeuBarScreen} />
        <Tab.Screen name="Favoritos"  component={FavoritosStack} />
        <Tab.Screen name="Perfil"     component={PerfilScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
