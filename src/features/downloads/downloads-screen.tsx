import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { BookCover } from '@/features/catalog';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { formatRelativeTime, useT } from '@/shared/i18n';
import { confirm, notify } from '@/shared/lib/dialogs';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Button, CenteredMessage, Text } from '@/shared/ui';

import { useDownloadsStore } from './downloads.store';

import type { DownloadedBook } from './types';

const COVER_WIDTH = 48;

/** Завантажені книги: відкриваються без мережі; видно, скільки місця займають. */
export function DownloadsScreen() {
  const t = useT();
  const items = useDownloadsStore((s) => s.items);
  const remove = useDownloadsStore((s) => s.remove);
  const list = Object.values(items).sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  const total = list.reduce((sum, item) => sum + item.size, 0);

  const handleRemove = async (item: DownloadedBook) => {
    const isConfirmed = await confirm({
      title: `${t.downloads.remove}: «${item.book.title}»?`,
      confirmText: t.downloads.remove,
      destructive: true,
    });

    if (isConfirmed) {
      await remove(item.book.id).then(
        () => notify.success(t.downloads.removed),
        () => notify.error(t.errors.unknown),
      );
    }
  };

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => item.book.id}
      style={styles.list}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        list.length > 0 ? (
          <Text variant="sectionLabel">{t.downloads.total(t.downloads.size(total))}</Text>
        ) : null
      }
      ListEmptyComponent={<CenteredMessage title={t.downloads.empty} />}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/reader/[id]', params: { id: item.book.id } })}
            style={({ pressed }) => [styles.main, pressed && styles.pressed]}>
            <BookCover book={item.book} width={COVER_WIDTH} />
            <View style={styles.info}>
              <Text variant="label" numberOfLines={2}>
                {item.book.title}
              </Text>
              <Text variant="caption">{item.book.author}</Text>
              <Text variant="caption" color="textFaint">
                {`${t.downloads.size(item.size)} · ${formatRelativeTime(t, item.savedAt)}`}
              </Text>
            </View>
          </Pressable>
          <Button
            size="sm"
            variant="danger"
            icon="trash-2"
            accessibilityLabel={t.downloads.remove}
            onPress={() => void handleRemove(item)}
          />
        </View>
      )}
    />
  );
}

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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: 2 },
  pressed: { opacity: 0.8 },
});
