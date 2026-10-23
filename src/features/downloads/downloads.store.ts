import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { catalogApi, type BookContent, type CatalogBook } from '@/features/catalog';
import { kvStorage } from '@/shared/lib/kv-storage';
import { persistStorage } from '@/shared/lib/persist';

import type { DownloadedBook } from './types';

/** Текст лежить окремо від списку: список маленький і читається при кожному запуску. */
const contentKey = (bookId: string) => `download:${bookId}`;

interface DownloadsState {
  items: Record<string, DownloadedBook>;
  download: (book: CatalogBook) => Promise<void>;
  remove: (bookId: string) => Promise<void>;
}

/**
 * Завантажені книги: текст і зміст зберігаються на пристрої (файли — на телефоні,
 * IndexedDB — у браузері), тож рідер відкриває їх без мережі.
 */
export const useDownloadsStore = create<DownloadsState>()(
  persist(
    (set, get) => ({
      items: {},

      async download(book) {
        const content = await catalogApi.getContent(book.id);

        // Тексту немає (PDF поки не розбирається) — зберігати нічого
        if (content.paragraphs.length === 0) {
          throw new Error('empty_content');
        }

        const json = JSON.stringify(content);

        await kvStorage.setItem(contentKey(book.id), json);
        set({
          items: {
            ...get().items,
            [book.id]: {
              book,
              size: new TextEncoder().encode(json).length,
              savedAt: new Date().toISOString(),
            },
          },
        });
      },

      async remove(bookId) {
        await kvStorage.removeItem(contentKey(bookId));

        const { [bookId]: _removed, ...rest } = get().items;

        set({ items: rest });
      },
    }),
    { name: 'downloads', storage: persistStorage },
  ),
);

/**
 * Збережений текст книги або null, якщо книгу не завантажено чи файл пошкоджено.
 * Читаємо сам файл, а не список: при холодному старті без мережі список може
 * бути ще не прочитаний з диска.
 */
export async function readDownloadedContent(bookId: string): Promise<BookContent | null> {
  try {
    const raw = await kvStorage.getItem(contentKey(bookId));

    return raw ? (JSON.parse(raw) as BookContent) : null;
  } catch {
    return null;
  }
}

export const useDownload = (bookId: string) => useDownloadsStore((s) => s.items[bookId] ?? null);
