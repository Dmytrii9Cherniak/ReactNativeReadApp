import type { BookContent, CatalogBook, CatalogPage, CatalogQuery } from './types';

/**
 * Контракт каталогу = майбутні ендпоінти бекенду:
 *   GET /books?search=&limit=&offset=  → CatalogPage
 *   GET /books/:id                     → CatalogBook
 *   GET /books/:id/content             → BookContent
 */
export interface CatalogApi {
  listBooks(query: CatalogQuery): Promise<CatalogPage>;
  getBook(id: string): Promise<CatalogBook>;
  getContent(id: string): Promise<BookContent>;
}
