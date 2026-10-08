import { create } from 'zustand';

import { toDayKey } from './lib/day-key';
import { statsStorage } from './stats.storage';

import type { DailyPages } from './types';

interface StatsState {
  daily: DailyPages;
  isLoaded: boolean;
  load: () => Promise<void>;
  /** Додає прочитані умовні сторінки до сьогоднішнього дня. */
  addPages: (pages: number) => Promise<void>;
}

export const useStatsStore = create<StatsState>()((set, get) => ({
  daily: {},
  isLoaded: false,

  async load() {
    if (get().isLoaded) {
      return;
    }

    set({ daily: await statsStorage.read(), isLoaded: true });
  },

  async addPages(pages) {
    if (pages <= 0) {
      return;
    }

    const today = toDayKey(new Date());
    const { daily } = get();
    const next = { ...daily, [today]: (daily[today] ?? 0) + pages };

    set({ daily: next });
    await statsStorage.write(next);
  },
}));

function sumPages(daily: DailyPages): number {
  return Object.values(daily).reduce((sum, pages) => sum + pages, 0);
}

/* Селектори повертають числа — компонент перерендериться лише коли число зміниться */
export const useTotalPages = () => useStatsStore((s) => sumPages(s.daily));
export const useTodayPages = () => useStatsStore((s) => s.daily[toDayKey(new Date())] ?? 0);
