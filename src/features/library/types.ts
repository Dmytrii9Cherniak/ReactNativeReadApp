export type BookFormat = 'pdf' | 'epub' | 'txt';

export const SUPPORTED_FORMATS: BookFormat[] = ['pdf', 'epub', 'txt'];

/**
 * Місце в книзі. Кожен формат зберігає позицію у своїх одиницях:
 * - page   — PDF, сторінки з 1
 * - cfi    — EPUB, EPUB CFI (стабільний між розмірами шрифту й екрану)
 * - line   — TXT, індекс першого видимого рядка файлу (з 0); не залежить від шрифту й ширини
 */
export type ReadingLocation =
  | { type: 'page'; page: number; pageCount: number }
  | { type: 'cfi'; cfi: string }
  | { type: 'line'; line: number };

export interface ReadingProgress {
  location: ReadingLocation;
  /** Прочитана частка книги 0..1 — для прогрес-бару, незалежно від формату. */
  fraction: number;
  /**
   * Найдальша досягнута позиція в умовних сторінках — для статистики читання.
   * Відсутня в прогресі, збереженому до появи статистики.
   */
  furthestPages?: number;
  updatedAt: string;
}

export interface Book {
  id: string;
  title: string;
  format: BookFormat;
  /** Ім'я файлу всередині Paths.document/books */
  fileName: string;
  size?: number;
  addedAt: string;
  progress?: ReadingProgress;
}
