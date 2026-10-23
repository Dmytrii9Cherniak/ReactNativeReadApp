import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

export interface Bookmark {
  paragraph: number;
  /** Початок абзацу — щоб у списку було видно, що це за місце */
  excerpt: string;
  createdAt: string;
}

const EXCERPT_LENGTH = 160;

interface BookmarksState {
  byBook: Record<string, Bookmark[]>;
  toggle: (bookId: string, paragraph: number, text: string) => boolean;
}

/** Закладки й цитати — на пристрої. Повторний тап по закладці прибирає її. */
export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      byBook: {},

      toggle(bookId, paragraph, text) {
        const current = get().byBook[bookId] ?? [];
        const exists = current.some((item) => item.paragraph === paragraph);
        const next = exists
          ? current.filter((item) => item.paragraph !== paragraph)
          : [
              ...current,
              {
                paragraph,
                excerpt: text.slice(0, EXCERPT_LENGTH),
                createdAt: new Date().toISOString(),
              },
            ].sort((a, b) => a.paragraph - b.paragraph);

        set({ byBook: { ...get().byBook, [bookId]: next } });

        return !exists;
      },
    }),
    { name: 'bookmarks', storage: persistStorage },
  ),
);

const NO_BOOKMARKS: Bookmark[] = [];

export const useBookBookmarks = (bookId: string) =>
  useBookmarksStore((s) => s.byBook[bookId] ?? NO_BOOKMARKS);

export const useBookmarksCount = () =>
  useBookmarksStore((s) => Object.values(s.byBook).reduce((sum, list) => sum + list.length, 0));
