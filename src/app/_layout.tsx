import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { can, useAuthStore } from '@/features/auth';
import { useProgressionStore } from '@/features/progression';
import { READING_FONT_ASSETS, useRestoreBrightness } from '@/features/settings';
import { useShelvesStore } from '@/features/shelves';
import { useT } from '@/shared/i18n';
import { runInBackground } from '@/shared/lib/background';
import { campfireColors, colors, navigationTheme } from '@/shared/theme';
import { HeaderTitle } from '@/shared/ui';

// Заставка тримається, поки не завантажені шрифти й не перевірена збережена сесія
runInBackground(() => SplashScreen.preventAutoHideAsync());

/** Будь-яка помилка рендеру нижче — запасний екран замість падіння застосунку. */
export { ErrorFallback as ErrorBoundary } from '@/shared/ui';

export default function RootLayout() {
  const t = useT();
  const [fontsLoaded, fontsError] = useFonts(READING_FONT_ASSETS);
  const isAuthReady = useAuthStore((s) => s.isReady);
  const user = useAuthStore((s) => s.user);
  const isReady = (fontsLoaded || fontsError !== null) && isAuthReady;

  useRestoreBrightness();
  useUserData(user?.id ?? null);

  useEffect(() => {
    if (isReady) {
      runInBackground(() => SplashScreen.hideAsync());
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  const campfireHeader = {
    headerStyle: { backgroundColor: campfireColors.background },
    headerTintColor: campfireColors.ember,
    contentStyle: { backgroundColor: campfireColors.background },
  };

  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
            headerTintColor: colors.textSecondary,
            headerBackButtonDisplayMode: 'minimal',
            headerTitle: ({ children }) => <HeaderTitle>{children}</HeaderTitle>,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="book/[id]" options={{ title: '' }} />
          <Stack.Screen name="reader/[id]" options={{ title: '' }} />
          <Stack.Screen name="story/[id]" options={{ title: '', ...campfireHeader }} />
          <Stack.Screen name="terms" options={{ title: t.terms.title }} />

          {/* Вхід і реєстрація — лише для гостей: після входу ці екрани закриваються самі */}
          <Stack.Protected guard={!user}>
            <Stack.Screen name="login" options={{ title: t.auth.loginTitle }} />
            <Stack.Screen name="signup" options={{ title: t.auth.signupTitle }} />
            <Stack.Screen name="verify" options={{ title: t.auth.verifyTitle }} />
          </Stack.Protected>

          <Stack.Protected guard={can(user, 'campfire.tell')}>
            <Stack.Screen
              name="story/new"
              options={{ title: t.campfire.newTitle, ...campfireHeader }}
            />
          </Stack.Protected>
          <Stack.Protected guard={can(user, 'profile')}>
            <Stack.Screen name="faction" options={{ title: t.progression.factionTitle }} />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

/** Дані, що належать користувачу: підвантажити після входу, прибрати після виходу. */
function useUserData(userId: string | null) {
  const loadProgress = useProgressionStore((s) => s.load);
  const resetProgress = useProgressionStore((s) => s.reset);
  const loadShelves = useShelvesStore((s) => s.load);
  const resetShelves = useShelvesStore((s) => s.reset);

  useEffect(() => {
    if (!userId) {
      resetProgress();
      resetShelves();

      return;
    }

    // Ранг у меню й позначки полиць. Помилки покажуть «Профіль» і «Мої книги»,
    // які при відкритті завантажують ці дані самі
    loadProgress().catch(() => undefined);
    loadShelves().catch(() => undefined);
  }, [userId, loadProgress, loadShelves, resetProgress, resetShelves]);
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
