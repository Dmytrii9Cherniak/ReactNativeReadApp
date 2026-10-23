import type { BookLanguage } from '@/features/catalog';

/** Файл книги, обраний на пристрої. */
export interface BookFile {
  name: string;
  uri: string;
  mimeType: string | null;
}

export interface BookSubmission {
  title: string;
  author: string;
  description: string;
  language: BookLanguage;
  file: BookFile;
  cover: BookFile | null;
}
