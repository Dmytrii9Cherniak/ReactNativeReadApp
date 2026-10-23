import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

import { addDays, localDayKey } from './lib/day';

/** Варіанти денної цілі, хвилини. */
export const DAILY_GOALS = [10, 20, 30, 60] as const;
const NIGHT_HOURS_END = 5;

interface ReadingStatsState {
  /** Секунди читання за кожну добу */
  days: Record<string, number>;
  finishedBookIds: string[];
  hasReadAtNight: boolean;
  dailyGoal: number;
  addReadingTime: (seconds: number) => void;
  markFinished: (bookId: string) => void;
  setDailyGoal: (minutes: number) => void;
}

/**
 * Статистика читання — на пристрої (з бекендом синхронізуватиметься).
 * Час рахує рідер, поки він відкритий і застосунок на екрані.
 */
export const useReadingStatsStore = create<ReadingStatsState>()(
  persist(
    (set, get) => ({
      days: {},
      finishedBookIds: [],
      hasReadAtNight: false,
      dailyGoal: 20,

      addReadingTime(seconds) {
        const now = new Date();
        const today = localDayKey(now);
        const { days, hasReadAtNight } = get();

        set({
          days: { ...days, [today]: (days[today] ?? 0) + seconds },
          hasReadAtNight: hasReadAtNight || now.getHours() < NIGHT_HOURS_END,
        });
      },

      markFinished(bookId) {
        const { finishedBookIds } = get();

        if (!finishedBookIds.includes(bookId)) {
          set({ finishedBookIds: [...finishedBookIds, bookId] });
        }
      },

      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
    }),
    { name: 'reading-stats', storage: persistStorage },
  ),
);

const minutesOf = (seconds = 0) => Math.floor(seconds / 60);

export interface ReadingSummary {
  todayMinutes: number;
  /** Хвилини з понеділка по неділю поточного тижня */
  week: number[];
  /** Днів поспіль з читанням (сьогодні можна ще не читати — серія не згорає) */
  streak: number;
  bestDayMinutes: number;
  finishedBooks: number;
  hasReadAtNight: boolean;
}

export function summarize(
  state: Pick<ReadingStatsState, 'days' | 'finishedBookIds' | 'hasReadAtNight'>,
  now = new Date(),
): ReadingSummary {
  const { days } = state;
  // getDay(): 0 — неділя; тиждень у нас з понеділка
  const monday = addDays(now, -((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, index) =>
    minutesOf(days[localDayKey(addDays(monday, index))]),
  );

  let streak = 0;
  let cursor = minutesOf(days[localDayKey(now)]) > 0 ? now : addDays(now, -1);

  while (minutesOf(days[localDayKey(cursor)]) > 0) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return {
    todayMinutes: minutesOf(days[localDayKey(now)]),
    week,
    streak,
    bestDayMinutes: Math.max(0, ...Object.values(days).map(minutesOf)),
    finishedBooks: state.finishedBookIds.length,
    hasReadAtNight: state.hasReadAtNight,
  };
}
