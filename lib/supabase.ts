import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Mecanismo de armazenamento seguro que evita o erro "DOMException: The operation is insecure"
const createSafeStorage = () => {
  const memoryStore = new Map<string, string>();

  return {
    getItem: (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch (e) {
        // Bloqueado pelo navegador
      }
      return memoryStore.get(key) || null;
    },
    setItem: (key: string, value: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
          return;
        }
      } catch (e) {
        // Bloqueado pelo navegador
      }
      memoryStore.set(key, value);
    },
    removeItem: (key: string) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return;
        }
      } catch (e) {
        // Bloqueado pelo navegador
      }
      memoryStore.delete(key);
    },
  };
};

export const supabase = createClient(url, key, {
  auth: {
    storage: createSafeStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// No mobile, renova o token apenas enquanto a app está em primeiro plano
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
