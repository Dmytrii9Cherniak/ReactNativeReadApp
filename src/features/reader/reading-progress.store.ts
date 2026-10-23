import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

export interface ReadingPosition {
  /** Перший видимий абзац — з нього продовжуємо читання */
  paragraph: number;
  /** Прочитана частка книги 0…1 */
  fraction: number;
  updatedAt: string;
}

interface ReadingProgressState {
  positions: Record<string, ReadingPosition>;
  save: (bookId: string, position: Omit<ReadingPosition, 'updatedAt'>) => void;
}

/**
 * Де зупинився читач. Поки зберігається на пристрої;
 * з бекендом — синхронізація між пристроями (PUT /me/books/:id/progress).
 */
export const useReadingProgressStore = create<ReadingProgressState>()(
  persist(
    (set, get) => ({
      positions: {},
      save(bookId, position) {
        set({
          positions: {
            ...get().positions,
            [bookId]: { ...position, updatedAt: new Date().toISOString() },
          },
        });
      },
    }),
    { name: 'reading-progress', storage: persistStorage },
  ),
);

export const useReadingPosition = (bookId: string) =>
  useReadingProgressStore((s) => s.positions[bookId] ?? null);
