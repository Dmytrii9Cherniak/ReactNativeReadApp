import type {
  AdminBook,
  AdminBookDetails,
  AdminStats,
  AdminStory,
  AdminUser,
  AuditEntry,
  AuditGroup,
  BookPatch,
  Broadcast,
  ContentStatus,
  ListQuery,
  Role,
  UserFilter,
} from './types';

/**
 * Контракт адмінки = майбутні ендпоінти (усі — лише роль admin, кожна дія пишеться в журнал):
 *
 *   GET    /admin/stats                                → AdminStats
 *   GET    /admin/books?status=&search=                → AdminBook[]
 *   GET    /admin/books/:id                            → AdminBookDetails
 *   PATCH  /admin/books/:id            BookPatch       → AdminBook
 *   POST   /admin/books/:id/approve                    → AdminBook  (+ сповіщення автору)
 *   POST   /admin/books/:id/reject     { reason }      → AdminBook  (+ сповіщення з причиною)
 *   POST   /admin/books/:id/hide | /restore            → AdminBook
 *   DELETE /admin/books/:id                            → 204
 *   …те саме для /admin/stories (без PATCH)
 *   GET    /admin/users?filter=&search=                → AdminUser[]
 *   GET    /admin/users/:id                            → AdminUser
 *   PATCH  /admin/users/:id            { role }        → AdminUser
 *   POST   /admin/users/:id/block      { reason }      → AdminUser  (вихід з усіх сесій)
 *   POST   /admin/users/:id/unblock                    → AdminUser
 *   POST   /admin/users/:id/xp         { amount, reason } → AdminUser
 *   POST   /admin/broadcasts           Broadcast       → 204  (сповіщення всім)
 *   GET    /admin/audit?group=                         → AuditEntry[]
 *   GET    /admin/events  (SSE)                        → подія «черга змінилась»
 */
export interface AdminApi {
  getStats(): Promise<AdminStats>;

  listBooks(query: ListQuery<ContentStatus>): Promise<AdminBook[]>;
  getBook(id: string): Promise<AdminBookDetails>;
  updateBook(id: string, patch: BookPatch): Promise<AdminBook>;
  approveBook(id: string): Promise<AdminBook>;
  rejectBook(id: string, reason: string): Promise<AdminBook>;
  setBookHidden(id: string, hidden: boolean): Promise<AdminBook>;
  deleteBook(id: string): Promise<void>;

  listStories(query: ListQuery<ContentStatus>): Promise<AdminStory[]>;
  approveStory(id: string): Promise<AdminStory>;
  rejectStory(id: string, reason: string): Promise<AdminStory>;
  setStoryHidden(id: string, hidden: boolean): Promise<AdminStory>;
  deleteStory(id: string): Promise<void>;

  listUsers(query: { filter?: UserFilter; search?: string }): Promise<AdminUser[]>;
  getUser(id: string): Promise<AdminUser>;
  setRole(id: string, role: Role): Promise<AdminUser>;
  blockUser(id: string, reason: string): Promise<AdminUser>;
  unblockUser(id: string): Promise<AdminUser>;
  adjustXp(id: string, amount: number, reason: string): Promise<AdminUser>;

  broadcast(message: Broadcast): Promise<void>;
  listAudit(group?: AuditGroup): Promise<AuditEntry[]>;

  /** Живі оновлення черги перевірки; повертає «відписатися». */
  subscribe(listener: () => void): () => void;
}
