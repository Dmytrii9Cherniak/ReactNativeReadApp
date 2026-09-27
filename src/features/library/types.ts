export type BookFormat = 'pdf' | 'epub' | 'txt';

export const SUPPORTED_FORMATS: BookFormat[] = ['pdf', 'epub', 'txt'];

/** Прогрес читання. Для PDF — сторінки (з 1). */
export interface ReadingProgress {
  page: number;
  pageCount: number;
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
