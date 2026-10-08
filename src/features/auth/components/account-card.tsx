import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { confirm } from '@/shared/lib/dialogs';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, Text } from '@/shared/ui';

import { useAuthStore, useCurrentUser } from '../auth.store';
import { AuthGate, GuestOnly } from './auth-gate';

import type { User } from '../types';

/** Блок акаунта в профілі: гість — вхід / реєстрація, користувач — дані й вихід. */
export function AccountCard() {
  return (
    <View style={styles.card}>
      <GuestOnly>
        <Text variant="mono">Акаунт</Text>
        <Text variant="title">Гість</Text>
        <Text variant="caption">
          Увійди, щоб мати акаунт. Бібліотека й ранги працюють і без нього.
        </Text>
        <View style={styles.actions}>
          <Button title="Увійти" onPress={() => router.push('/login')} />
          <Button title="Реєстрація" variant="outline" onPress={() => router.push('/register')} />
        </View>
      </GuestOnly>

      <AuthGate>
        <SignedInAccount />
      </AuthGate>
    </View>
  );
}

function SignedInAccount() {
  const user = useCurrentUser();
  const logout = useAuthStore((s) => s.logout);

  if (!user) {
    return null;
  }

  const confirmLogout = async () => {
    const confirmed = await confirm({ title: 'Вийти з акаунта?', confirmText: 'Вийти' });

    if (confirmed) {
      await logout();
    }
  };

  return (
    <>
      <Text variant="mono">Акаунт</Text>
      <Text variant="title">{user.name}</Text>
      <Text variant="caption">{user.email}</Text>
      <RoleBadges user={user} />
      <View style={styles.actions}>
        <Button title="Вийти" variant="outline" onPress={confirmLogout} />
      </View>
    </>
  );
}

function RoleBadges({ user }: { user: User }) {
  const roles = [
    user.isAdmin && 'Адмін',
    user.canModerateBooks && 'Модератор книг',
    user.canModerateStories && 'Модератор історій',
  ].filter((role) => role !== false);

  if (roles.length === 0) {
    return null;
  }

  return (
    <Text variant="mono" color="primary">
      {roles.join(' // ')}
    </Text>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, paddingTop: spacing.sm },
});
