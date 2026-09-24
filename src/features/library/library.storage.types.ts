import type { DocumentPickerAsset } from 'expo-document-picker';

import type { Book } from './types';

/**
 * Контракт сховища бібліотеки.
 * Реалізації: library.storage.ts (iOS/Android, файлова система)
 *             library.storage.web.ts (web, IndexedDB)
 * Metro сам підставляє потрібну за розширенням .web.ts.
 */
export interface LibraryStorage {
  readIndex(): Promise<Book[]>;
  writeIndex(books: Book[]): Promise<void>;
  saveBookFile(asset: DocumentPickerAsset, fileName: string): Promise<void>;
  deleteBookFile(fileName: string): Promise<void>;
  readBookText(fileName: string): Promise<string>;
}
