import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useLibraryStore } from '@/features/library';
import { colors, navigationTheme, typography } from '@/shared/theme';

export default function RootLayout() {
  const loadLibrary = useLibraryStore((s) => s.load);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: {
            fontFamily: typography.heading.fontFamily,
            fontWeight: typography.heading.fontWeight,
            color: colors.foreground,
          },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reader/[id]" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}
