import type { Book } from '../types';

/** Прогрес у форматі до появи ReadingLocation (лише PDF-сторінки). */
interface LegacyProgress {
  page: number;
  pageCount: number;
  updatedAt: string;
}

function isLegacyProgress(progress: unknown): progress is LegacyProgress {
  return (
    typeof progress === 'object' &&
    progress !== null &&
    'page' in progress &&
    !('location' in progress)
  );
}

/**
 * Приводить запис зі збереженого індексу до поточної моделі Book.
 * Викликається один раз при завантаженні бібліотеки; нові записи вже в актуальному форматі.
 */
export function migrateBook(book: Book): Book {
  const progress: unknown = book.progress;

  if (!isLegacyProgress(progress)) {
    return book;
  }

  const { page, pageCount, updatedAt } = progress;

  return {
    ...book,
    progress: {
      location: { type: 'page', page, pageCount },
      fraction: page / pageCount,
      updatedAt,
    },
  };
}
