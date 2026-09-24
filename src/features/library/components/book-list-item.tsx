import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { formatFileSize } from '../lib/book-format';

import type { Book } from '../types';

interface BookListItemProps {
  book: Book;
  onPress: (book: Book) => void;
  onLongPress: (book: Book) => void;
}

export function BookListItem({ book, onPress, onLongPress }: BookListItemProps) {
  return (
    <Pressable
      onPress={() => onPress(book)}
      onLongPress={() => onLongPress(book)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Text variant="label" numberOfLines={2}>
        {book.title}
      </Text>
      <View style={styles.meta}>
        <View style={styles.badge}>
          <Text variant="mono" color="primary">
            {book.format}
          </Text>
        </View>
        <Text variant="mono">{formatFileSize(book.size)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderLeftWidth: borderWidth.accent,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.primary,
  },
});
