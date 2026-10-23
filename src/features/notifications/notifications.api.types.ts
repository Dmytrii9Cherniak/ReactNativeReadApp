import type { AppNotification } from './types';

/**
 * Контракт сповіщень = майбутні ендпоінти (потрібен токен):
 *   GET  /me/notifications            → AppNotification[]  (нові першими)
 *   POST /me/notifications/read-all   → 204
 *   GET  /me/events  (SSE)            → подія «є нові сповіщення»
 */
export interface NotificationsApi {
  list(): Promise<AppNotification[]>;
  markAllRead(): Promise<void>;
  /** Живі оновлення; повертає «відписатися». */
  subscribe(listener: () => void): () => void;
}
