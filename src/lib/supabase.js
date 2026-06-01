import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Substitua pela SUA publishable key (a sb_publishable_... que você copiou)
const supabaseUrl = 'https://gryjztelmvmyxbixtgqc.supabase.co';
const supabaseKey = 'sb_publishable_cZnpgRFwg1NqxTEqX1FeZQ_Cqt71uNI';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
