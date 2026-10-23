import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { errorText, formatRelativeTime, useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { CenteredMessage, Icon, Loader, Text } from '@/shared/ui';

import { formatNotification, NOTIFICATION_ICONS } from './lib/format';
import { useNotificationsStore } from './notifications.store';

import type { AppNotification } from './types';

/** Вхідні: відповіді на книги й історії, зміни досвіду й ролі, оголошення адміна. */
export function NotificationsScreen() {
  const t = useT();
  const items = useNotificationsStore((s) => s.items);
  const load = useNotificationsStore((s) => s.load);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Відкрили розділ — нове вважається прочитаним (підсвітка лишається до наступного разу)
    load()
      .then(markAllRead)
      .catch((caught: unknown) => setError(errorText(t, caught)));
  }, [load, markAllRead, t]);

  if (!items) {
    return error ? <CenteredMessage title={t.common.loadError} description={error} /> : <Loader />;
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NotificationCard notification={item} />}
      ListEmptyComponent={<CenteredMessage title={t.notifications.empty} />}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
}

function NotificationCard({ notification }: { notification: AppNotification }) {
  const t = useT();
  const { title, text } = formatNotification(t, notification);
  const isRejected = notification.kind.endsWith('_rejected');

  return (
    <View style={[styles.card, !notification.read && styles.unread]}>
      <Icon
        name={NOTIFICATION_ICONS[notification.kind]}
        color={isRejected ? 'danger' : notification.read ? 'textMuted' : 'primaryLight'}
      />
      <View style={styles.text}>
        <Text variant="label">{title}</Text>
        {text ? (
          <Text variant="caption" color="textSecondary">
            {text}
          </Text>
        ) : null}
        <Text variant="caption" color="textFaint">
          {formatRelativeTime(t, notification.createdAt)}
        </Text>
      </View>
      {notification.read ? null : <View style={styles.dot} />}
    </View>
  );
}

const DOT_SIZE = 8;

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unread: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  text: { flex: 1, gap: spacing.xs },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    marginTop: spacing.xs,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primaryLight,
  },
});
