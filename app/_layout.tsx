// Polyfill de proteção contra o DOMException no navegador
if (typeof window !== 'undefined') {
  try {
    window.localStorage.getItem('test');
  } catch (e) {
    const memoryStore = new Map();
    const safeStorage = {
      getItem: (key: string) => memoryStore.get(key) || null,
      setItem: (key: string, value: string) => { memoryStore.set(key, value); },
      removeItem: (key: string) => { memoryStore.delete(key); },
      clear: () => { memoryStore.clear(); },
      key: (index: number) => Array.from(memoryStore.keys())[index] || null,
      length: 0,
    };
    Object.defineProperty(window, 'localStorage', { value: safeStorage, configurable: true });
    Object.defineProperty(window, 'sessionStorage', { value: safeStorage, configurable: true });
  }
}

import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';

function AuthGuard() {
  const { colors } = useTheme();
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAuthGroup = segments[0] === '(auth)';

    if (session && !inTabsGroup) {
      // Se está logado e NÃO está nas tabs, redireciona para as tabs
      router.replace('/(tabs)');
    } else if (!session && !inAuthGroup) {
      // Se NÃO está logado e NÃO está no auth/login, redireciona para login
      router.replace('/(auth)/login');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // O Stack autogerido carrega as rotas corretamente sem loops
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function ThemedApp() {
  const { mode } = useTheme();
  return <><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><AuthGuard /></>;
}
