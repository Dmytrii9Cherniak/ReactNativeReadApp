import { create } from 'zustand';

import { adminApi } from './admin.api';

import type { AdminStats } from './types';

interface AdminState {
  stats: AdminStats | null;
  loadStats: () => Promise<void>;
  /** Живий лічильник черги для меню; повертає «зупинити» */
  start: () => () => void;
  reset: () => void;
}

/** Огляд адмінки й лічильник заявок у меню — оновлюються самі, коли приходить нова заявка. */
export const useAdminStore = create<AdminState>()((set, get) => ({
  stats: null,

  async loadStats() {
    set({ stats: await adminApi.getStats() });
  },

  start() {
    const refresh = () => {
      // Лічильник у меню — не критичний: якщо не оновився, оновиться з наступною подією
      get()
        .loadStats()
        .catch(() => undefined);
    };

    refresh();

    return adminApi.subscribe(refresh);
  },

  reset() {
    set({ stats: null });
  },
}));

/** Скільки книг та історій чекає перевірки (0 — не адмін або ще не завантажено). */
export const usePendingCount = () =>
  useAdminStore((s) => (s.stats ? s.stats.pendingBooks + s.stats.pendingStories : 0));
