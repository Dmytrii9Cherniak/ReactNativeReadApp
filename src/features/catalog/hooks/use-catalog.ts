import { useAsync } from '@/shared/hooks/use-async';

import { catalogApi } from '../catalog.api';

/** Поки без пагінації: каталог невеликий, одна сторінка — до 50 книг. */
const LIBRARY_PAGE_SIZE = 50;

/** Книги бібліотеки; `search` — пошук за назвою чи автором (на сервері). */
export function useLibraryBooks(search = '') {
  const query = search.trim();

  return useAsync(`library:${query}`, () =>
    catalogApi.listBooks({ search: query || undefined, limit: LIBRARY_PAGE_SIZE, offset: 0 }),
  );
}

export function useCatalogBook(id: string) {
  return useAsync(`book:${id}`, () => catalogApi.getBook(id));
}
