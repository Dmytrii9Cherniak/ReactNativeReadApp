import type { DayKey } from '../types';

/** Ключ дня за локальним часом: «2026-10-08». toISOString() не підходить — він у UTC. */
export function toDayKey(date: Date): DayKey {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${date.getFullYear()}-${month}-${day}`;
}
