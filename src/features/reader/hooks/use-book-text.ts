import { libraryStorage, type Book } from '@/features/library';
import { useAsync } from '@/shared/hooks/use-async';

export function useBookText(book: Book) {
  return useAsync(book.fileName, () => libraryStorage.readBookText(book.fileName));
}
