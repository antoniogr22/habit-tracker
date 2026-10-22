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

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { theme } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';

function Routes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg }}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={client}>
      <AuthProvider>
        <StatusBar style="dark" />
        <Routes />
      </AuthProvider>
    </QueryClientProvider>
  );
}
