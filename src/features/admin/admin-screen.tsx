import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { ROLES, useCurrentUser, type Role, type User } from '@/features/auth';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { CenteredMessage, Chip, Loader, Text } from '@/shared/ui';

import { adminApi } from './admin.api';

/** Користувачі й ролі (лише адмін): зміна ролі — одразу змінює доступи користувача. */
export function AdminScreen() {
  const t = useT();
  const me = useCurrentUser();
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listUsers()
      .then(setUsers)
      .catch((caught: unknown) => setError(errorText(t, caught)));
  }, [t]);

  if (!users) {
    return error ? <CenteredMessage title={t.common.loadError} description={error} /> : <Loader />;
  }

  const changeRole = async (user: User, role: Role) => {
    // Власну роль змінити не можна (сервер теж це перевіряє)
    if (user.role === role || user.id === me?.id) {
      return;
    }

    try {
      const updated = await adminApi.setRole(user.id, role);

      setUsers((list) => list?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
    } catch (caught) {
      notify.error(errorText(t, caught));
    }
  };

  return (
    <FlatList
      data={users}
      keyExtractor={(user) => user.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <Text variant="caption" style={styles.hint}>
          {t.admin.hint}
        </Text>
      }
      renderItem={({ item }) => {
        const isMe = item.id === me?.id;

        return (
          <View style={styles.row}>
            <Text variant="label">
              {isMe ? `${item.nickname} (${t.admin.you})` : item.nickname}
            </Text>
            <Text variant="caption">{item.email}</Text>
            <View style={styles.roles}>
              {ROLES.map((role) => (
                <Chip
                  key={role}
                  label={t.roles[role]}
                  selected={item.role === role}
                  onPress={() => void changeRole(item, role)}
                />
              ))}
            </View>
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  hint: { padding: spacing.lg },
  row: {
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
  },
  roles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
});
