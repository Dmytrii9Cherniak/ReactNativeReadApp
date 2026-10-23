import type { AdReward, FactionId, FactionRating, FactionStats, Progress } from './types';

/**
 * Контракт досвіду й угруповань = майбутні ендпоінти (потрібен токен):
 *   GET  /me/progress                    → Progress
 *   POST /me/ad-views                    → AdReward     (≤ 3 на день, +1…5 XP)
 *   GET  /factions                       → FactionStats[]
 *   GET  /factions/rating                → FactionRating[]  (тиждень, з понеділка)
 *   PUT  /me/faction    { factionId }    → Progress     (раз на 30 днів)
 * Усі правила нарахування XP і ліміти перевіряє сервер — клієнт лише показує.
 */
export interface ProgressionApi {
  getProgress(): Promise<Progress>;
  watchAd(): Promise<AdReward>;
  listFactions(): Promise<FactionStats[]>;
  getWeeklyRating(): Promise<FactionRating[]>;
  joinFaction(factionId: FactionId): Promise<Progress>;
}
