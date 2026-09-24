import * as DocumentPicker from 'expo-document-picker';
import { create } from 'zustand';

import { detectBookFormat, stripExtension } from './lib/book-format';
import { libraryStorage } from './library.storage';
import type { Book } from './types';

export interface ImportResult {
  added: Book[];
  /** Імена файлів з непідтримуваним форматом */
  skipped: string[];
}

interface LibraryState {
  books: Book[];
  isLoaded: boolean;
  load: () => Promise<void>;
  importFromPicker: () => Promise<ImportResult>;
  remove: (id: string) => Promise<void>;
}

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useLibraryStore = create<LibraryState>()((set, get) => {
  const saveBooks = async (books: Book[]) => {
    await libraryStorage.writeIndex(books);
    set({ books });
  };

  return {
    books: [],
    isLoaded: false,

    async load() {
      if (get().isLoaded) {
        return;
      }
      const books = await libraryStorage.readIndex();
      set({ books, isLoaded: true });
    },

    async importFromPicker() {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        copyToCacheDirectory: true,
      });
      if (result.canceled) {
        return { added: [], skipped: [] };
      }

      const added: Book[] = [];
      const skipped: string[] = [];

      for (const asset of result.assets) {
        const format = detectBookFormat(asset.name);
        if (!format) {
          skipped.push(asset.name);
          continue;
        }

        const id = createId();
        const fileName = `${id}.${format}`;
        await libraryStorage.saveBookFile(asset, fileName);

        added.push({
          id,
          title: stripExtension(asset.name),
          format,
          fileName,
          size: asset.size,
          addedAt: new Date().toISOString(),
        });
      }

      if (added.length > 0) {
        await saveBooks([...added, ...get().books]);
      }
      return { added, skipped };
    },

    async remove(id) {
      const book = get().books.find((b) => b.id === id);
      if (!book) {
        return;
      }
      await libraryStorage.deleteBookFile(book.fileName);
      await saveBooks(get().books.filter((b) => b.id !== id));
    },
  };
});

/* Селектори — компоненти підписуються лише на потрібну частину стану */
export const useBooks = () => useLibraryStore((s) => s.books);
export const useBook = (id: string) => useLibraryStore((s) => s.books.find((b) => b.id === id));
