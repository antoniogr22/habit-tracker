import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ComponentProps } from 'react';
import { Platform } from 'react-native';
import { theme } from '@/lib/theme';

const c = theme.colors;
type IconName = ComponentProps<typeof Ionicons>['name'];

/** Ícone preenchido quando a aba está ativa, contornado quando não. */
const icon = (active: IconName, inactive: IconName) =>
  function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return <Ionicons name={focused ? active : inactive} size={26} color={color} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        // O título agora vive dentro de <Screen title="..."> para alinhar com o conteúdo centralizado.
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarActiveBackgroundColor: c.primarySoft,
        // Sem isso, em telas largas (web/tablet) o rótulo vai ao lado do ícone e a barra fica desproporcional.
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700', marginTop: 2 },
        tabBarItemStyle: { borderRadius: 20, marginHorizontal: 4, paddingVertical: 4 },
        // Barra flutuante em formato de pílula, com a mesma largura máxima do conteúdo.
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Platform.OS === 'web' ? 16 : 20,
          maxWidth: theme.layout.maxWidth,
          marginHorizontal: 'auto',
          height: 72,
          paddingTop: 6,
          paddingBottom: 6,
          paddingHorizontal: 6,
          borderRadius: theme.radius.xl,
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: c.line,
          backgroundColor: c.surface,
          ...theme.shadow.floating,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoje', tabBarIcon: icon('checkmark-circle', 'checkmark-circle-outline') }} />
      <Tabs.Screen name="goals" options={{ title: 'Metas', tabBarIcon: icon('flag', 'flag-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon('person-circle', 'person-circle-outline') }} />
    </Tabs>
  );
}
