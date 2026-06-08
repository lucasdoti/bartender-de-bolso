import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isNative = Platform.OS !== 'web';

export async function requestPermission() {
  if (!isNative) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (_) { return false; }
}

export async function scheduleWeeklyReminder() {
  if (!isNative) return false;
  const granted = await requestPermission();
  if (!granted) return false;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Sexta chegando! 🍸',
        body: 'Que drink você vai preparar hoje? Abra o Bartender de Bolso.',
        sound: true,
      },
      trigger: { weekday: 6, hour: 18, minute: 0, repeats: true },
    });
    return true;
  } catch (_) { return false; }
}

export async function cancelWeeklyReminder() {
  if (!isNative) return;
  try { await Notifications.cancelAllScheduledNotificationsAsync(); } catch (_) {}
}

export async function getIsReminderActive() {
  if (!isNative) return false;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled.length > 0;
  } catch (_) { return false; }
}
