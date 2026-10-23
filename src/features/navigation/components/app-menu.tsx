import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { can, useAuthStore } from '@/features/auth';
import { useT } from '@/shared/i18n';
import { confirm, showMessage } from '@/shared/lib/dialogs';
import { borderWidth, colors, radius, spacing, type ColorToken } from '@/shared/theme';
import { Icon, Text, type IconName } from '@/shared/ui';

import { MENU_GROUPS, type MenuItem } from '../menu-items';
import { MenuUser } from './menu-user';

import type { DrawerContentComponentProps } from 'expo-router/drawer';

/** Вміст меню (макет, екран 2): користувач, пункти за роллю, підтримка, вихід. */
export function AppMenu({ state, navigation }: DrawerContentComponentProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeRoute = state.routes[state.index].name;

  // На телефоні меню закривається; на планшеті (постійна панель) виклик нічого не робить
  const close = () => navigation.closeDrawer();

  const open = (item: MenuItem) => {
    navigation.navigate(item.route);
    close();
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: t.menu.logoutConfirm,
      confirmText: t.menu.logout,
      cancelText: t.common.cancel,
      destructive: true,
    });

    if (confirmed) {
      close();
      await logout();
    }
  };

  const groups = MENU_GROUPS.map((group) =>
    group.filter((item) => !item.permission || can(user, item.permission)),
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <MenuUser onNavigate={close} />

      {groups.map((group, index) => (
        <View key={index} style={styles.group}>
          {group.map((item) => (
            <MenuRow
              key={item.route}
              icon={item.icon}
              label={item.label(t)}
              isActive={item.route === activeRoute}
              onPress={() => open(item)}
            />
          ))}
          {index === groups.length - 1 ? (
            <MenuRow
              icon="heart"
              label={t.menu.support}
              color="warm"
              onPress={() => showMessage(t.settings.donate, t.settings.donateThanks)}
            />
          ) : null}
        </View>
      ))}

      {user ? (
        <View style={styles.group}>
          <MenuRow icon="log-out" label={t.menu.logout} color="textMuted" onPress={handleLogout} />
        </View>
      ) : null}
    </ScrollView>
  );
}

interface MenuRowProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  isActive?: boolean;
  color?: ColorToken;
}

function MenuRow({ icon, label, onPress, isActive = false, color }: MenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        isActive && styles.activeItem,
        pressed && styles.pressed,
      ]}>
      <Icon name={icon} color={color ?? (isActive ? 'primaryLight' : 'textMuted')} />
      <Text variant="label" color={color ?? (isActive ? 'primaryLight' : 'textSecondary')}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.md },
  group: {
    paddingVertical: spacing.sm,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
  },
  activeItem: { backgroundColor: colors.input },
  pressed: { opacity: 0.8 },
});
