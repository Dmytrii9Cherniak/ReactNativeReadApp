/** Сім угруповань — суто косметика: досвід і пороги рангів однакові для всіх. */
export type FactionId =
  'loners' | 'bandits' | 'military' | 'duty' | 'freedom' | 'scientists' | 'mercenaries';

/** Нараховане за сьогодні (ліміти скидаються щодоби). */
export interface TodayXp {
  /** XP за історію: 0 або 1 */
  story: number;
  /** Скільки вогників під вашими історіями зараховано сьогодні (кожен +0.5 XP) */
  fires: number;
  /** Скільки реклами переглянуто сьогодні */
  ads: number;
  /** XP за рекламу сьогодні */
  adXp: number;
}

/** Прогрес користувача — GET /me/progress. */
export interface Progress {
  xp: number;
  factionId: FactionId;
  /** Коли востаннє змінював угруповання; null — ще не змінював */
  factionChangedAt: string | null;
  storiesCount: number;
  firesReceived: number;
  nonStop: {
    /** Поточна серія днів поспіль з історією */
    streak: number;
    /** Скільки 90-денних серій завершено (бейдж — якщо ≥ 1) */
    earned: number;
  };
  today: TodayXp;
}

/** Угруповання з кількістю учасників — GET /factions. */
export interface FactionStats {
  id: FactionId;
  members: number;
}

export interface AdReward {
  xp: number;
  progress: Progress;
}
