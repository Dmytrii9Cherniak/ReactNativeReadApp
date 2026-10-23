import { Drawer } from 'expo-router/drawer';

import { can, useAuthStore } from '@/features/auth';
import { AppMenu } from '@/features/navigation';
import { DRAWER_SWIPE_EDGE_WIDTH, DRAWER_WIDTH } from '@/shared/constants/layout';
import { useLayout } from '@/shared/hooks/use-layout';
import { useT } from '@/shared/i18n';
import { borderWidth, campfireColors, colors } from '@/shared/theme';
import { HeaderTitle } from '@/shared/ui';

/**
 * Головна навігація — один Drawer, два вигляди:
 * - телефон: меню виїжджає зліва по ☰ або свайпом від лівого краю (макет, екран 2);
 * - планшет: те саме меню завжди видно збоку, кнопки ☰ немає.
 * Розділи без дозволу закриті (Drawer.Protected) — недоступні навіть за прямим посиланням.
 */
/** Помилка в будь-якому розділі меню — запасний екран з «Спробувати ще раз» і «На головну». */
export { ErrorFallback as ErrorBoundary } from '@/shared/ui';

export default function MainLayout() {
  const t = useT();
  const { isTablet } = useLayout();
  const user = useAuthStore((s) => s.user);

  return (
    <Drawer
      drawerContent={(props) => <AppMenu {...props} />}
      screenOptions={{
        drawerType: isTablet ? 'permanent' : 'front',
        swipeEnabled: !isTablet,
        swipeEdgeWidth: DRAWER_SWIPE_EDGE_WIDTH,
        drawerStyle: {
          width: DRAWER_WIDTH,
          backgroundColor: colors.surface,
          borderRightWidth: borderWidth.hairline,
          borderRightColor: colors.border,
        },
        overlayColor: colors.overlay,
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.textSecondary,
        headerTitle: ({ children }) => <HeaderTitle>{children}</HeaderTitle>,
        // На планшеті меню видно завжди — кнопка-гамбургер не потрібна
        headerLeft: isTablet ? () => null : undefined,
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: t.app.name,
          headerTitle: ({ children }) => <HeaderTitle variant="appTitle">{children}</HeaderTitle>,
        }}
      />
      <Drawer.Screen
        name="campfire"
        options={{
          title: t.menu.campfire,
          headerStyle: { backgroundColor: campfireColors.background },
          headerTintColor: campfireColors.ember,
          sceneStyle: { backgroundColor: campfireColors.background },
        }}
      />
      <Drawer.Screen name="settings" options={{ title: t.menu.settings }} />
      <Drawer.Screen name="about" options={{ title: t.menu.about }} />

      <Drawer.Protected guard={can(user, 'shelves')}>
        <Drawer.Screen name="my-books" options={{ title: t.menu.myBooks }} />
      </Drawer.Protected>
      <Drawer.Protected guard={can(user, 'profile')}>
        <Drawer.Screen name="profile" options={{ title: t.menu.profile }} />
      </Drawer.Protected>
      <Drawer.Protected guard={can(user, 'books.upload')}>
        <Drawer.Screen name="upload" options={{ title: t.menu.upload }} />
      </Drawer.Protected>
      <Drawer.Protected guard={can(user, 'moderation')}>
        <Drawer.Screen name="moderation" options={{ title: t.menu.moderation }} />
      </Drawer.Protected>
      <Drawer.Protected guard={can(user, 'users.manage')}>
        <Drawer.Screen name="admin" options={{ title: t.menu.admin }} />
      </Drawer.Protected>
    </Drawer>
  );
}
