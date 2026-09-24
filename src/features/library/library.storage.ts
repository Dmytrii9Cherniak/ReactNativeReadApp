import { Directory, File, Paths } from 'expo-file-system';

import type { LibraryStorage } from './library.storage.types';
import type { Book } from './types';

/**
 * iOS / Android: файли книг у Paths.document/books,
 * індекс бібліотеки — Paths.document/library.json.
 */
const booksDir = () => new Directory(Paths.document, 'books');
const indexFile = () => new File(Paths.document, 'library.json');
const bookFile = (fileName: string) => new File(booksDir(), fileName);

export const libraryStorage: LibraryStorage = {
  async readIndex() {
    const file = indexFile();

    if (!file.exists) {
      return [];
    }

    try {
      return JSON.parse(await file.text()) as Book[];
    } catch {
      return [];
    }
  },

  async writeIndex(books) {
    indexFile().write(JSON.stringify(books));
  },

  async saveBookFile(asset, fileName) {
    booksDir().create({ intermediates: true, idempotent: true });
    new File(asset.uri).copy(bookFile(fileName));
  },

  async deleteBookFile(fileName) {
    const file = bookFile(fileName);

    if (file.exists) {
      file.delete();
    }
  },

  readBookText(fileName) {
    return bookFile(fileName).text();
  },
};
