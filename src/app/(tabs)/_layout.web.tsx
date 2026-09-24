import { Tabs } from 'expo-router';

import { borderWidth, colors, typography } from '@/shared/theme';

/** Web: нативних табів немає — звичайна панель вкладок зверху. */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarPosition: 'top',
        tabBarLabelPosition: 'beside-icon',
        tabBarIcon: () => null,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: typography.heading,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderBottomWidth: borderWidth.hairline,
          borderBottomColor: colors.border,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Бібліотека' }} />
      <Tabs.Screen name="settings" options={{ title: 'Налаштування' }} />
    </Tabs>
  );
}
