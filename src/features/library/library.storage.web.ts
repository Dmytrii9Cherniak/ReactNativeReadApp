import { del, get, set } from 'idb-keyval';

import type { LibraryStorage } from './library.storage.types';
import type { Book } from './types';

/**
 * Web: усе зберігається в IndexedDB браузера.
 * Індекс — під ключем INDEX_KEY, файли книг — як Blob під ключем `book:<fileName>`.
 */
const INDEX_KEY = 'library:index';
const bookKey = (fileName: string) => `book:${fileName}`;

export const libraryStorage: LibraryStorage = {
  async readIndex() {
    return (await get<Book[]>(INDEX_KEY)) ?? [];
  },

  async writeIndex(books) {
    await set(INDEX_KEY, books);
  },

  async saveBookFile(asset, fileName) {
    const blob = asset.file ?? (await (await fetch(asset.uri)).blob());
    await set(bookKey(fileName), blob);
  },

  async deleteBookFile(fileName) {
    await del(bookKey(fileName));
  },

  async readBookText(fileName) {
    const blob = await get<Blob>(bookKey(fileName));
    if (!blob) {
      throw new Error('Файл не знайдено');
    }
    return blob.text();
  },
};
