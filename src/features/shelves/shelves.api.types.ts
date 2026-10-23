import type { Shelf, ShelfEntry } from './types';

/**
 * Контракт полиць = майбутні ендпоінти (лише для залогінених):
 *   GET    /me/books               → ShelfEntry[]
 *   PUT    /me/books/:bookId       { shelf } → ShelfEntry
 *   DELETE /me/books/:bookId       → 204
 */
export interface ShelvesApi {
  list(): Promise<ShelfEntry[]>;
  put(bookId: string, shelf: Shelf): Promise<ShelfEntry>;
  remove(bookId: string): Promise<void>;
}
