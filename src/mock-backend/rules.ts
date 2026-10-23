import type { DailyCounters, UserRecord } from './db';

/**
 * Правила досвіду з дизайн-документа (розділ 2). На справжньому бекенді
 * вони живуть на сервері — клієнт нічого не нараховує сам.
 */
export const XP_RULES = {
  story: 1,
  storiesPerDay: 1,
  fire: 0.5,
  /** Скільки вогників на добу дають досвід автору (+10 XP) */
  firesPerDay: 20,
  adsPerDay: 3,
  adMin: 1,
  adMax: 5,
  /** Вогники дають досвід лише від акаунтів із рангом «Новенький» і вище */
  minXpToGiveFire: 10,
  factionCooldownDays: 30,
  nonStopDays: 90,
} as const;

export const DAY_MS = 24 * 60 * 60 * 1000;

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function emptyDaily(day = dayKey()): DailyCounters {
  return { day, story: 0, fires: 0, ads: 0, adXp: 0 };
}

/** Лічильники за сьогодні; якщо збережені — за вчора чи раніше, починаємо з нуля. */
export function todayOf(user: UserRecord): DailyCounters {
  const today = dayKey();

  if (user.daily.day !== today) {
    user.daily = emptyDaily(today);
  }

  return user.daily;
}

export function isYesterday(day: string | null): boolean {
  return day === dayKey(new Date(Date.now() - DAY_MS));
}
