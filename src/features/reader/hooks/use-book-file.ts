import { libraryStorage, type Book } from '@/features/library';
import { useAsync } from '@/shared/hooks/use-async';

/** URI файлу книги для нативних / web-рідерів. Ресурс звільняється автоматично. */
export function useBookFile(book: Book) {
  return useAsync(
    book.fileName,
    () => libraryStorage.openBookFile(book.fileName),
    (file) => file.release(),
  );
}
