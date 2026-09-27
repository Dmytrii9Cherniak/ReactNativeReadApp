import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLibraryStore, type Book } from '@/features/library';
import { colors } from '@/shared/theme';
import { CenteredMessage, Loader } from '@/shared/ui';

import { PageIndicator } from './page-indicator';
import { PdfReader } from './pdf-reader';
import { useBookFile } from '../hooks/use-book-file';

/** PDF-книга: завантаження файлу, відновлення та збереження позиції читання. */
export function PdfBook({ book }: { book: Book }) {
  const file = useBookFile(book);
  const saveProgress = useLibraryStore((s) => s.saveProgress);
  const [initialPage] = useState(book.progress?.page ?? 1);
  const [position, setPosition] = useState(book.progress ?? null);

  if (file.status === 'loading') {
    return <Loader />;
  }

  if (file.status === 'error') {
    return <CenteredMessage title="Не вдалося відкрити файл" description={file.message} />;
  }

  const handlePageChange = (page: number, pageCount: number) => {
    setPosition({ page, pageCount, updatedAt: new Date().toISOString() });
    void saveProgress(book.id, page, pageCount);
  };

  return (
    <View style={styles.container}>
      <PdfReader uri={file.value.uri} initialPage={initialPage} onPageChange={handlePageChange} />
      {position ? <PageIndicator page={position.page} pageCount={position.pageCount} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
