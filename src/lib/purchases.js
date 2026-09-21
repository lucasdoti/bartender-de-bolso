import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

const IOS_KEY     = 'test_ukZWTFzdDPvTYftzNhHGwKxNAep';
const ANDROID_KEY = 'ANDROID_KEY_PLACEHOLDER';

export function configurePurchases() {
  if (Platform.OS === 'web') return;
  try {
    Purchases.setLogLevel(LOG_LEVEL.ERROR);
    Purchases.configure({
      apiKey: Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY,
    });
  } catch (e) {
    console.warn('RevenueCat config error:', e);
  }
}

export async function checkPremiumEntitlement() {
  if (Platform.OS === 'web') return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return !!info.entitlements.active['premium'];
  } catch (_) {
    return false;
  }
}

export async function getOfferings() {
  if (Platform.OS === 'web') return null;
  try {
    return await Purchases.getOfferings();
  } catch (_) {
    return null;
  }
}

export async function purchasePackage(pkg) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return !!customerInfo.entitlements.active['premium'];
}

export async function restorePurchases() {
  if (Platform.OS === 'web') return false;
  try {
    const info = await Purchases.restorePurchases();
    return !!info.entitlements.active['premium'];
  } catch (_) {
    return false;
  }
}

export function addCustomerInfoListener(callback) {
  if (Platform.OS === 'web') return () => {};
  return Purchases.addCustomerInfoUpdateListener(info => {
    callback(!!info.entitlements.active['premium']);
  });
}
