import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useAuthStatus, useAuthStore } from '@/features/auth';
import { useLibraryStore } from '@/features/library';
import { useStatsStore } from '@/features/stats';
import { navigationTheme, stackScreenOptions } from '@/shared/theme';

export default function RootLayout() {
  const loadLibrary = useLibraryStore((s) => s.load);
  const loadStats = useStatsStore((s) => s.load);
  const restoreSession = useAuthStore((s) => s.restore);
  const authStatus = useAuthStatus();

  useEffect(() => {
    loadLibrary();
    loadStats();
    restoreSession();
  }, [loadLibrary, loadStats, restoreSession]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="reader/[id]" options={{ title: '' }} />

        {/* Гард маршрутів: екрани входу лише для гостей. Після входу роутер сам їх закриває. */}
        <Stack.Protected guard={authStatus !== 'authenticated'}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </ThemeProvider>
  );
}
