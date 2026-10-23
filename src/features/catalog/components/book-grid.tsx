import { FlashList } from '@shopify/flash-list';
import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';

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
 *
 * У стані зберігається саме кількість колонок, а не ширина: onLayout на web спрацьовує
 * часто й з дробовими значеннями, і кожна нова ширина перемальовувала б список
 * (це давало «Maximum update depth exceeded»). Однакова кількість колонок — без рендеру.
 */
export function BookGrid({
  books,
  onPressBook,
  showAuthor,
  ListHeaderComponent,
  ListEmptyComponent,
}: BookGridProps) {
  const [columns, setColumns] = useState<number | null>(null);

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = Math.floor(event.nativeEvent.layout.width);

    if (width > 0) {
      setColumns(getColumnCount(width - spacing.lg * 2, GAP));
    }
  };

  // Порожній стан — без FlashList: віртуалізувати нічого, а розтягнутий на весь екран
  // ListEmptyComponent у віртуалізованому списку на web провокує зайві перерахунки
  if (books.length === 0) {
    return (
      <View style={[styles.container, styles.empty]}>
        {ListHeaderComponent}
        {ListEmptyComponent}
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {columns !== null ? (
        <FlashList
          // Зміна кількості колонок — новий список (як вимагають списки RN)
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
          contentContainerStyle={styles.content}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  empty: { paddingHorizontal: spacing.lg - GAP / 2 },
  content: { paddingHorizontal: spacing.lg - GAP / 2, paddingBottom: spacing.xl },
  cell: { flex: 1, paddingHorizontal: GAP / 2, paddingBottom: spacing.lg },
});
