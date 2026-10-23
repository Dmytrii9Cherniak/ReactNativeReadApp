import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePendingCount } from '@/features/admin';
import { can, useAuthStore } from '@/features/auth';
import { useUnreadCount } from '@/features/notifications';
import { useLayout } from '@/shared/hooks/use-layout';
import { useT } from '@/shared/i18n';
import { confirm, notify } from '@/shared/lib/dialogs';
import { borderWidth, colors, radius, spacing, type ColorToken } from '@/shared/theme';
import { Icon, Text, type IconName } from '@/shared/ui';

import { MENU_GROUPS, type MenuItem } from '../menu-items';
import { useMenuStore } from '../menu.store';
import { MenuUser } from './menu-user';

import type { DrawerContentComponentProps } from 'expo-router/drawer';

/**
 * Вміст меню (макет, екран 2): користувач, пункти за роллю, підтримка, вихід.
 * На планшеті меню можна згорнути до іконок — кнопка внизу панелі.
 */
export function AppMenu({ state, navigation }: DrawerContentComponentProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const { isTablet } = useLayout();
  const isCollapsedSetting = useMenuStore((s) => s.isCollapsed);
  const toggleCollapsed = useMenuStore((s) => s.toggle);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const activeRoute = state.routes[state.index].name;
  // Лічильники біля пунктів: нові сповіщення й заявки на перевірку (оновлюються наживо)
  const badges: Record<string, number> = {
    notifications: useUnreadCount(),
    admin: usePendingCount(),
  };
  // Згорнуте меню — лише на планшеті: на телефоні воно й так ховається
  const isCompact = isTablet && isCollapsedSetting;

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
        isCompact && styles.compactContent,
        { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg },
      ]}>
      <MenuUser onNavigate={close} isCompact={isCompact} />

      {groups.map((group, index) => (
        <View key={index} style={styles.group}>
          {group.map((item) => (
            <MenuRow
              key={item.route}
              icon={item.icon}
              label={item.label(t)}
              badge={badges[item.route]}
              isActive={item.route === activeRoute}
              isCompact={isCompact}
              onPress={() => open(item)}
            />
          ))}
          {index === groups.length - 1 ? (
            <MenuRow
              icon="heart"
              label={t.menu.support}
              color="warm"
              isCompact={isCompact}
              onPress={() => notify.info(t.settings.donate, t.settings.donateThanks)}
            />
          ) : null}
        </View>
      ))}

      {user ? (
        <View style={styles.group}>
          <MenuRow
            icon="log-out"
            label={t.menu.logout}
            color="textMuted"
            isCompact={isCompact}
            onPress={handleLogout}
          />
        </View>
      ) : null}

      {isTablet ? (
        <View style={styles.group}>
          <MenuRow
            icon={isCompact ? 'chevrons-right' : 'chevrons-left'}
            label={isCompact ? t.menu.expand : t.menu.collapse}
            color="textMuted"
            isCompact={isCompact}
            onPress={toggleCollapsed}
          />
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
  isCompact?: boolean;
  color?: ColorToken;
  badge?: number;
}

function MenuRow({
  icon,
  label,
  onPress,
  isActive = false,
  isCompact = false,
  color,
  badge = 0,
}: MenuRowProps) {
  const textColor = color ?? (isActive ? 'primaryLight' : 'textSecondary');
  const badgeText = badge > 99 ? '99+' : String(badge);

  return (
    <Pressable
      accessibilityRole="button"
      // У згорнутому меню підпису не видно — його читає екранний диктор
      accessibilityLabel={badge > 0 ? `${label}, ${badgeText}` : label}
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        isCompact && styles.compactItem,
        isActive && styles.activeItem,
        pressed && styles.pressed,
      ]}>
      <View>
        <Icon name={icon} color={color ?? (isActive ? 'primaryLight' : 'textMuted')} />
        {isCompact && badge > 0 ? <View style={styles.dot} /> : null}
      </View>
      {isCompact ? null : (
        <>
          <Text variant="label" color={textColor} numberOfLines={1} style={styles.label}>
            {label}
          </Text>
          {badge > 0 ? (
            <View style={styles.badge}>
              <Text variant="caption" color="onPrimary" style={styles.badgeText}>
                {badgeText}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const DOT_SIZE = 8;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.md },
  compactContent: { paddingHorizontal: spacing.sm, alignItems: 'center' },
  group: {
    alignSelf: 'stretch',
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
  compactItem: { justifyContent: 'center', paddingHorizontal: 0 },
  activeItem: { backgroundColor: colors.input },
  label: { flex: 1 },
  badge: {
    minWidth: 20,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  badgeText: { fontWeight: '700' },
  dot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.gold,
  },
  pressed: { opacity: 0.8 },
});
