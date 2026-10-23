import { create } from 'zustand';

import { shelvesApi } from './shelves.api';

import type { Shelf, ShelfEntry } from './types';

interface ShelvesState {
  /** Книги на полицях за id книги */
  entries: Record<string, ShelfEntry>;
  isLoaded: boolean;
  load: () => Promise<void>;
  /** Покласти книгу на полицю; null — прибрати з полиць */
  setShelf: (bookId: string, shelf: Shelf | null) => Promise<void>;
  /** Вихід з акаунта: полиці належать користувачу */
  reset: () => void;
}

export const useShelvesStore = create<ShelvesState>()((set, get) => ({
  entries: {},
  isLoaded: false,

  async load() {
    const list = await shelvesApi.list();

    set({
      entries: Object.fromEntries(list.map((entry) => [entry.book.id, entry])),
      isLoaded: true,
    });
  },

  async setShelf(bookId, shelf) {
    if (shelf === null) {
      await shelvesApi.remove(bookId);

      const { [bookId]: _removed, ...rest } = get().entries;

      set({ entries: rest });

      return;
    }

    const entry = await shelvesApi.put(bookId, shelf);

    set({ entries: { ...get().entries, [bookId]: entry } });
  },

  reset() {
    set({ entries: {}, isLoaded: false });
  },
}));

/** Полиця конкретної книги; null — книги немає на полицях. */
export const useBookShelf = (bookId: string) =>
  useShelvesStore((s) => s.entries[bookId]?.shelf ?? null);
