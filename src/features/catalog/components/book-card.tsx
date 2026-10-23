import { Pressable, StyleSheet } from 'react-native';

import { releaseFocus } from '@/shared/lib/focus';
import { spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { BookCover } from './book-cover';

import type { CatalogBook } from '../types';

interface BookCardProps {
  book: CatalogBook;
  onPress: (book: CatalogBook) => void;
  /** Показувати автора під назвою (у «Моїх книгах» макет його не показує) */
  showAuthor?: boolean;
}

export function BookCard({ book, onPress, showAuthor = true }: BookCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        releaseFocus();
        onPress(book);
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <BookCover book={book} />
      <Text variant="bookTitle" numberOfLines={2}>
        {book.title}
      </Text>
      {showAuthor ? (
        <Text variant="caption" numberOfLines={1}>
          {book.author}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  pressed: { opacity: 0.8 },
});
