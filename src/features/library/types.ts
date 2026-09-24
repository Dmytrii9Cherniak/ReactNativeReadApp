export type BookFormat = 'pdf' | 'epub' | 'txt';

export const SUPPORTED_FORMATS: BookFormat[] = ['pdf', 'epub', 'txt'];

export interface Book {
  id: string;
  title: string;
  format: BookFormat;
  /** Ім'я файлу всередині Paths.document/books */
  fileName: string;
  size?: number;
  addedAt: string;
}
