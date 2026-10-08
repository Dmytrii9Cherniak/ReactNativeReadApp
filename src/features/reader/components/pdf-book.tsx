import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLibraryStore, type Book, type ReadingLocation } from '@/features/library';
import { colors } from '@/shared/theme';
import { CenteredMessage, Loader } from '@/shared/ui';

import { PageIndicator } from './page-indicator';
import { PdfReader } from './pdf-reader';
import { useBookFile } from '../hooks/use-book-file';
import { useReadPagesTracker } from '../hooks/use-read-pages-tracker';

type PageLocation = Extract<ReadingLocation, { type: 'page' }>;

/** PDF-книга: завантаження файлу, відновлення та збереження позиції читання. */
export function PdfBook({ book }: { book: Book }) {
  const file = useBookFile(book);
  const saveProgress = useLibraryStore((s) => s.saveProgress);
  const trackReadPages = useReadPagesTracker(book);
  const [savedLocation] = useState(() => getSavedPage(book));
  const [position, setPosition] = useState(savedLocation);

  if (file.status === 'loading') {
    return <Loader />;
  }

  if (file.status === 'error') {
    return <CenteredMessage title="Не вдалося відкрити файл" description={file.message} />;
  }

  const handlePageChange = (page: number, pageCount: number) => {
    const location: PageLocation = { type: 'page', page, pageCount };

    setPosition(location);
    void saveProgress(book.id, {
      location,
      fraction: page / pageCount,
      // Відкрита сторінка вважається прочитаною
      furthestPages: trackReadPages(page),
    });
  };

  return (
    <View style={styles.container}>
      <PdfReader
        uri={file.value.uri}
        initialPage={savedLocation?.page ?? 1}
        onPageChange={handlePageChange}
      />
      {position ? <PageIndicator page={position.page} pageCount={position.pageCount} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});

/** Збережена сторінка, якщо прогрес книги записаний у сторінках. */
function getSavedPage(book: Book): PageLocation | null {
  const location = book.progress?.location;

  return location?.type === 'page' ? location : null;
}
