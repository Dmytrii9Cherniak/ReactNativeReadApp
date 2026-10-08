import * as DocumentPicker from 'expo-document-picker';
import { create } from 'zustand';

import { getErrorMessage } from '@/shared/lib/errors';

import { detectBookFormat, stripExtension } from './lib/book-format';
import { migrateBook } from './lib/migrations';
import { libraryStorage } from './library.storage';

import type { Book, ReadingProgress } from './types';

export interface ImportResult {
  added: Book[];
  /** Імена файлів з непідтримуваним форматом */
  skipped: string[];
  /** «ім'я: причина» для файлів, які не вдалося скопіювати */
  failed: string[];
}

interface LibraryState {
  books: Book[];
  isLoaded: boolean;
  load: () => Promise<void>;
  importFromPicker: () => Promise<ImportResult>;
  remove: (id: string) => Promise<void>;
  /** Рідер передає прогрес у своїх одиницях; час оновлення ставить стор. */
  saveProgress: (id: string, progress: Omit<ReadingProgress, 'updatedAt'>) => Promise<void>;
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

      const books = (await libraryStorage.readIndex()).map(migrateBook);
      set({ books, isLoaded: true });
    },

    async importFromPicker() {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
        // Файл копіюємо самі одразу в сховище бібліотеки — без проміжної копії в кеші.
        // Android: копія з кешу пікера в Expo Go не читається (expo/expo#21792),
        // а content:// URI читається. iOS і так віддає локальну копію файлу.
        copyToCacheDirectory: false,
      });

      if (result.canceled) {
        return { added: [], skipped: [], failed: [] };
      }

      const added: Book[] = [];
      const skipped: string[] = [];
      const failed: string[] = [];

      for (const asset of result.assets) {
        const format = detectBookFormat(asset.name);

        if (!format) {
          skipped.push(asset.name);
          continue;
        }

        const id = createId();
        const fileName = `${id}.${format}`;

        try {
          await libraryStorage.saveBookFile(asset, fileName);
        } catch (error) {
          failed.push(`${asset.name}: ${getErrorMessage(error)}`);
          continue;
        }

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

      return { added, skipped, failed };
    },

    async remove(id) {
      const book = get().books.find((b) => b.id === id);

      if (!book) {
        return;
      }

      await libraryStorage.deleteBookFile(book.fileName);
      await saveBooks(get().books.filter((b) => b.id !== id));
    },

    async saveProgress(id, progress) {
      const updated: ReadingProgress = { ...progress, updatedAt: new Date().toISOString() };

      await saveBooks(get().books.map((b) => (b.id === id ? { ...b, progress: updated } : b)));
    },
  };
});

/* Селектори — компоненти підписуються лише на потрібну частину стану */
export const useBooks = () => useLibraryStore((s) => s.books);
export const useBook = (id: string) => useLibraryStore((s) => s.books.find((b) => b.id === id));
