import type { DailyPages } from './types';

/**
 * Контракт сховища статистики.
 * Реалізації: stats.storage.ts (iOS/Android, JSON-файл), stats.storage.web.ts (web, IndexedDB).
 */
export interface StatsStorage {
  read(): Promise<DailyPages>;
  write(daily: DailyPages): Promise<void>;
}
