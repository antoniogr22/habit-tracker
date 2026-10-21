import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        headerStyle: { backgroundColor: theme.colors.bg },
        headerShadowVisible: false,
        headerTitleStyle: { color: theme.colors.ink, fontWeight: '700' },
        headerRight: () => (
          <Pressable accessibilityLabel="Sair" onPress={() => supabase.auth.signOut()} style={{ padding: 12 }}>
            <Ionicons name="log-out-outline" size={22} color={theme.colors.muted} />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Hoje', tabBarIcon: ({ color, size }) => <Ionicons name="checkmark-circle-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="goals"
        options={{ title: 'Metas', tabBarIcon: ({ color, size }) => <Ionicons name="flag-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
