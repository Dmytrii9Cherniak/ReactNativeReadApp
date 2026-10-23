import type { CatalogBook } from '@/features/catalog';

/** Полиці користувача. */
export type Shelf = 'want' | 'reading' | 'read';

/** Книга на полиці — так її повертатиме бекенд (GET /me/books). */
export interface ShelfEntry {
  book: CatalogBook;
  shelf: Shelf;
  updatedAt: string;
}
