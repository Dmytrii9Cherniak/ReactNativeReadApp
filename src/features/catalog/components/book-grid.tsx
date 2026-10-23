import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/shared/theme';

import { BookCard } from './book-card';
import { getColumnCount } from '../lib/grid';

import type { CatalogBook } from '../types';
import type { ReactElement } from 'react';

const GAP = spacing.md;

interface BookGridProps {
  books: CatalogBook[];
  onPressBook: (book: CatalogBook) => void;
  showAuthor?: boolean;
  ListHeaderComponent?: ReactElement;
  ListEmptyComponent?: ReactElement;
}

/**
 * Сітка обкладинок. Кількість колонок рахується від фактичної ширини області,
 * тож на планшеті з боковою панеллю і при повороті екрана сітка підлаштовується сама.
 */
export function BookGrid({
  books,
  onPressBook,
  showAuthor,
  ListHeaderComponent,
  ListEmptyComponent,
}: BookGridProps) {
  const [width, setWidth] = useState(0);
  const columns = getColumnCount(width - spacing.lg * 2, GAP);

  return (
    <View style={styles.container} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <FlashList
          key={columns}
          data={books}
          numColumns={columns}
          keyExtractor={(book) => book.id}
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BookCard book={item} onPress={onPressBook} showAuthor={showAuthor} />
            </View>
          )}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={styles.content}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg - GAP / 2, paddingBottom: spacing.xl },
  cell: { flex: 1, paddingHorizontal: GAP / 2, paddingBottom: spacing.lg },
});
