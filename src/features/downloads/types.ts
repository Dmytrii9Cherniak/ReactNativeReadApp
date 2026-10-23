import type { CatalogBook } from '@/features/catalog';

/** Книга, збережена на пристрої для читання без мережі. */
export interface DownloadedBook {
  book: CatalogBook;
  /** Розмір збереженого тексту, байти */
  size: number;
  savedAt: string;
}
