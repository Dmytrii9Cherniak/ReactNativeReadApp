import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ROLES, useCurrentUser, type Role } from '@/features/auth';
import { FactionAvatar, RankLabel } from '@/features/progression';
import { formatRelativeTime, useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Button, Card, CenteredMessage, Chip, Loader, Screen, Text } from '@/shared/ui';

import { adminApi } from './admin.api';
import { ReasonDialog } from './components/reason-dialog';
import { StatTile } from './components/stat-tile';
import { XpDialog } from './components/xp-dialog';
import { useAdminAction } from './lib/use-admin-action';
import { useAdminQuery } from './lib/use-admin-query';

import type { AdminUser } from './types';

/** Картка користувача: статистика, роль, блокування, ручна зміна досвіду. */
export function AdminUserScreen({ userId }: { userId: string }) {
  const t = useT();
  const { state, refresh } = useAdminQuery(`admin-user:${userId}`, () => adminApi.getUser(userId));

  if (state.status === 'loading') {
    return <Loader />;
  }

  if (state.status === 'error') {
    return <CenteredMessage title={t.errors.not_found} />;
  }

  return <UserDetails user={state.value} onChanged={refresh} />;
}

function UserDetails({ user, onChanged }: { user: AdminUser; onChanged: () => void }) {
  const t = useT();
  const me = useCurrentUser();
  const { run, isRunning } = useAdminAction(onChanged);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const isMe = user.id === me?.id;

  const changeRole = async (role: Role) => {
    // Власну роль змінити не можна (сервер теж це перевіряє)
    if (!isMe && user.role !== role) {
      await run(() => adminApi.setRole(user.id, role), t.admin.done.roleChanged);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: user.nickname }} />
      <Screen gap={spacing.lg}>
        <View style={styles.hero}>
          <FactionAvatar factionId={user.factionId} size={64} />
          <Text variant="screenTitle">{user.nickname}</Text>
          <RankLabel xp={user.xp} factionId={user.factionId} />
          <Text variant="caption">{user.email}</Text>
          <Text variant="caption" color="textFaint">
            {t.admin.users.joined(formatRelativeTime(t, user.createdAt))}
          </Text>
          {user.blocked ? (
            <Text variant="caption" color="danger">
              {t.admin.users.blockedBecause(user.blockReason ?? '—')}
            </Text>
          ) : null}
        </View>

        <View style={styles.tiles}>
          <StatTile value={user.xp} label={t.admin.users.xp} color="primaryLight" />
          <StatTile value={user.storiesCount} label={t.admin.users.stories} />
          <StatTile value={user.booksSubmitted} label={t.admin.users.books} />
        </View>

        <Card>
          <Text variant="sectionLabel">{t.admin.users.role}</Text>
          <View style={styles.row}>
            {ROLES.map((role) => (
              <Chip
                key={role}
                label={t.roles[role]}
                selected={user.role === role}
                onPress={() => void changeRole(role)}
              />
            ))}
          </View>
          {isMe ? <Text variant="caption">{t.admin.users.selfHint}</Text> : null}
        </Card>

        {isMe ? null : (
          <View style={styles.row}>
            <Button
              icon="zap"
              title={t.admin.users.adjustXp}
              onPress={() => setIsAdjusting(true)}
            />
            {user.blocked ? (
              <Button
                variant="success"
                icon="unlock"
                title={t.admin.users.unblock}
                loading={isRunning}
                onPress={() =>
                  void run(() => adminApi.unblockUser(user.id), t.admin.done.unblocked)
                }
              />
            ) : (
              <Button
                variant="danger"
                icon="slash"
                title={t.admin.users.block}
                onPress={() => setIsBlocking(true)}
              />
            )}
          </View>
        )}
      </Screen>

      <ReasonDialog
        visible={isBlocking}
        title={t.admin.users.blockTitle}
        hint={t.admin.users.blockHint}
        confirmText={t.admin.users.block}
        onSubmit={(reason) => run(() => adminApi.blockUser(user.id, reason), t.admin.done.blocked)}
        onClose={() => setIsBlocking(false)}
      />
      <XpDialog
        visible={isAdjusting}
        onSubmit={(amount, reason) =>
          run(() => adminApi.adjustXp(user.id, amount, reason), t.admin.done.xp(amount))
        }
        onClose={() => setIsAdjusting(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.xs },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
