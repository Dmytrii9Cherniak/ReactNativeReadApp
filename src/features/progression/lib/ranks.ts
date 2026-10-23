import { ENDGAME_RANK_NAMES, FACTION_RANK_NAMES } from './rank-names';

import type { FactionId } from '../types';

/** Порогове XP рангів 1–10 (дизайн-документ, розділ 3). Однакові для всіх угруповань. */
export const RANK_THRESHOLDS: readonly number[] = [
  0, 10, 50, 150, 400, 900, 1800, 3500, 10000, 15000,
];

/** З рангу «Сталкер» (4-й) підпис рангу стає золотистим. */
const GOLD_FROM_INDEX = 3;
/** Ранги 9–10 — ендгейм. */
const ENDGAME_FROM_INDEX = 8;

export interface Rank {
  /** 0…9 */
  index: number;
  name: string;
  threshold: number;
  /** Поріг наступного рангу; null — найвищий ранг */
  nextThreshold: number | null;
  isGold: boolean;
  isEndgame: boolean;
}

export function getRankIndex(xp: number): number {
  let index = 0;

  RANK_THRESHOLDS.forEach((threshold, i) => {
    if (xp >= threshold) {
      index = i;
    }
  });

  return index;
}

export function getRankName(index: number, factionId: FactionId): string {
  return index >= ENDGAME_FROM_INDEX
    ? ENDGAME_RANK_NAMES[index - ENDGAME_FROM_INDEX]
    : FACTION_RANK_NAMES[factionId][index];
}

export function getRankByIndex(index: number, factionId: FactionId): Rank {
  return {
    index,
    name: getRankName(index, factionId),
    threshold: RANK_THRESHOLDS[index],
    nextThreshold: RANK_THRESHOLDS[index + 1] ?? null,
    isGold: index >= GOLD_FROM_INDEX,
    isEndgame: index >= ENDGAME_FROM_INDEX,
  };
}

export function getRank(xp: number, factionId: FactionId): Rank {
  return getRankByIndex(getRankIndex(xp), factionId);
}

/** Частка шляху до наступного рангу (0…1); на найвищому — 1. */
export function getRankProgress(xp: number, rank: Rank): number {
  if (rank.nextThreshold === null) {
    return 1;
  }

  return (xp - rank.threshold) / (rank.nextThreshold - rank.threshold);
}

/** Вогник дає 0.5 XP — округлюємо до десятих, щоб не було 150.49999 */
export const roundXp = (xp: number) => Math.round(xp * 10) / 10;
