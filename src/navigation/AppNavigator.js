import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen        from '../screens/HomeScreen';
import CardapioScreen    from '../screens/CardapioScreen';
import DrinkDetailScreen from '../screens/DrinkDetailScreen';
import MeuBarScreen      from '../screens/MeuBarScreen';
import FavoritosScreen   from '../screens/FavoritosScreen';
import PerfilScreen      from '../screens/PerfilScreen';
import BartenderIAScreen from '../screens/BartenderIAScreen';
import AdminScreen       from '../screens/AdminScreen';
import FestaScreen       from '../screens/FestaScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Cardapio"  component={CardapioScreen} />
      <Tab.Screen name="MeuBar"    component={MeuBarScreen} />
      <Tab.Screen name="Favoritos" component={FavoritosScreen} />
      <Tab.Screen name="Perfil"    component={PerfilScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs"        component={Tabs} />
        <Stack.Screen name="DrinkDetail" component={DrinkDetailScreen} />
        <Stack.Screen name="BartenderIA" component={BartenderIAScreen} />
        <Stack.Screen name="Admin"       component={AdminScreen} />
        <Stack.Screen name="Festa"       component={FestaScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
