import type { Book } from './types';
import type { DocumentPickerAsset } from 'expo-document-picker';

/**
 * Контракт сховища бібліотеки.
 * Реалізації: library.storage.ts (iOS/Android, файлова система)
 *             library.storage.web.ts (web, IndexedDB)
 * Metro сам підставляє потрібну за розширенням .web.ts.
 */
/** Файл книги, доступний за URI. `release()` звільняє ресурси (на web — object URL). */
export interface BookFileHandle {
  uri: string;
  release(): void;
}

export interface LibraryStorage {
  readIndex(): Promise<Book[]>;
  writeIndex(books: Book[]): Promise<void>;
  saveBookFile(asset: DocumentPickerAsset, fileName: string): Promise<void>;
  deleteBookFile(fileName: string): Promise<void>;
  readBookText(fileName: string): Promise<string>;
  openBookFile(fileName: string): Promise<BookFileHandle>;
}
