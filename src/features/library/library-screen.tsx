import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { TAB_BAR_INSET } from '@/shared/constants/layout';
import { confirm, showMessage } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Button, CenteredMessage, Screen, ScreenHeader } from '@/shared/ui';

import { BookListItem } from './components/book-list-item';
import { useBooks, useLibraryStore } from './library.store';

import type { Book } from './types';

export function LibraryScreen() {
  const books = useBooks();
  const importFromPicker = useLibraryStore((s) => s.importFromPicker);
  const remove = useLibraryStore((s) => s.remove);

  const openBook = (book: Book) => {
    router.push({ pathname: '/reader/[id]', params: { id: book.id } });
  };

  const addBooks = async () => {
    try {
      const { skipped } = await importFromPicker();

      if (skipped.length > 0) {
        showMessage('Непідтримуваний формат', skipped.join('\n'));
      }
    } catch (e) {
      showMessage('Помилка', e instanceof Error ? e.message : String(e));
    }
  };

  const confirmRemove = async (book: Book) => {
    const confirmed = await confirm({
      title: 'Видалити книгу?',
      message: book.title,
      confirmText: 'Видалити',
      destructive: true,
    });

    if (confirmed) {
      await remove(book.id);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        eyebrow={`Архів // ${books.length}`}
        title="Бібліотека"
        action={<Button title="+ Додати" variant="outline" onPress={addBooks} />}
      />

      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BookListItem book={item} onPress={openBook} onLongPress={confirmRemove} />
        )}
        ListEmptyComponent={
          <CenteredMessage
            title="Архів порожній"
            description="Натисни «+ Додати», щоб вибрати PDF, EPUB або TXT"
          />
        }
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: TAB_BAR_INSET + spacing.lg,
  },
});
