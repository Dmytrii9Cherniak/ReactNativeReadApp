/** Мова книги. */
export type BookLanguage = 'uk' | 'en';

/** Формат файлу книги в каталозі. */
export type CatalogBookFormat = 'epub' | 'pdf';

/** Книга каталогу — так її повертатиме бекенд (див. docs/API.md). */
export interface CatalogBook {
  id: string;
  title: string;
  author: string;
  description: string;
  language: BookLanguage;
  format: CatalogBookFormat;
  /** URL обкладинки; null — показуємо заглушку */
  coverUrl: string | null;
  /** Скільки користувачів позначили книгу прочитаною */
  readCount: number;
}

export interface CatalogQuery {
  search?: string;
  limit: number;
  offset: number;
}

/** Сторінка каталогу. nextOffset = null — далі книг немає. */
export interface CatalogPage {
  items: CatalogBook[];
  total: number;
  nextOffset: number | null;
}

/** Текст книги для рідера: абзаци по порядку (розбір EPUB/PDF — на боці бекенду). */
export interface BookContent {
  bookId: string;
  paragraphs: string[];
}
