import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDrinkOfDay } from './drinkOfDay';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function scheduleDailyDrinkNotification() {
  if (Platform.OS === 'web') return;
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return;

    const drink = getDrinkOfDay();

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🍸 Drink do dia',
        body: drink
          ? `Que tal preparar um ${drink.name} hoje?`
          : 'Um novo drink te espera hoje!',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
      },
    });
  } catch (_) {}
}
