import { router } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';

import { AuthGate } from '@/features/auth';
import { RankStrip } from '@/features/stats';
import { TAB_BAR_INSET } from '@/shared/constants/layout';
import { confirm, showMessage } from '@/shared/lib/dialogs';
import { getErrorMessage } from '@/shared/lib/errors';
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
      const { skipped, failed } = await importFromPicker();

      if (skipped.length > 0) {
        showMessage('Непідтримуваний формат', skipped.join('\n'));
      }

      if (failed.length > 0) {
        showMessage('Не вдалося імпортувати', failed.join('\n'));
      }
    } catch (e) {
      showMessage('Помилка', getErrorMessage(e));
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
        action={
          // Додавати книги — лише після входу; читати вже додані може й гість
          <AuthGate>
            <Button title="+ Додати" variant="outline" onPress={addBooks} />
          </AuthGate>
        }
      />

      <RankStrip />

      <FlatList
        data={books}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <BookListItem book={item} onPress={openBook} onLongPress={confirmRemove} />
        )}
        ListEmptyComponent={
          <AuthGate fallback={<GuestEmptyLibrary />}>
            <CenteredMessage
              title="Архів порожній"
              description="Натисни «+ Додати», щоб вибрати PDF, EPUB або TXT"
            />
          </AuthGate>
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

function GuestEmptyLibrary() {
  return (
    <CenteredMessage title="Архів порожній" description="Увійди, щоб додавати книги">
      <Button title="Увійти" onPress={() => router.push('/login')} />
    </CenteredMessage>
  );
}
