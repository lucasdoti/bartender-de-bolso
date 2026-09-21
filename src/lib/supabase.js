import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// ⚠️ Substitua pela SUA publishable key (a sb_publishable_... que você copiou)
const supabaseUrl = 'https://gryjztelmvmyxbixtgqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdyeWp6dGVsbXZteXhiaXh0Z3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODY1OTIsImV4cCI6MjA5NTc2MjU5Mn0.yZOiQyiZ33-x7OQ-sVtxumiBptsa-CTWpuD_GONKN8c';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
