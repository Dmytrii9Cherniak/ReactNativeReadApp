import type { ModerationItem, ModerationKind } from './types';

/**
 * Контракт модерації = майбутні ендпоінти (роль moderator або admin):
 *   GET  /moderation/:kind              → ModerationItem[]   (kind: books | stories)
 *   POST /moderation/:kind/:id/approve  → 204  (з'являється в бібліотеці / біля вогнища)
 *   POST /moderation/:kind/:id/reject   → 204
 */
export interface ModerationApi {
  list(kind: ModerationKind): Promise<ModerationItem[]>;
  approve(kind: ModerationKind, id: string): Promise<void>;
  reject(kind: ModerationKind, id: string): Promise<void>;
}
