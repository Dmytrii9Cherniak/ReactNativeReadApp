import type { Role, User } from '@/features/auth';
import type { CatalogBook } from '@/features/catalog';
import type { FactionId } from '@/features/progression';

/**
 * Стан книги чи історії:
 * pending — чекає перевірки; published — видно всім; hidden — прихована адміном;
 * rejected — відхилена (автор бачить причину).
 */
export type ContentStatus = 'pending' | 'published' | 'hidden' | 'rejected';

/** Огляд для головного екрана адмінки — GET /admin/stats. */
export interface AdminStats {
  pendingBooks: number;
  pendingStories: number;
  users: number;
  blockedUsers: number;
  newUsersWeek: number;
  publishedBooks: number;
  storiesWeek: number;
  firesWeek: number;
  factions: { id: FactionId; members: number }[];
  /** Найактивніші за досвідом */
  topUsers: { id: string; nickname: string; xp: number; factionId: FactionId }[];
}

export interface AdminBook extends CatalogBook {
  status: ContentStatus;
  submittedBy: { id: string; nickname: string } | null;
  submittedAt: string;
  rejectReason: string | null;
}

/** Книга на перевірці з початком тексту — щоб оцінити, не відкриваючи файл. */
export interface AdminBookDetails extends AdminBook {
  excerpt: string[];
}

export type BookPatch = Partial<Pick<CatalogBook, 'title' | 'author' | 'description' | 'language'>>;

export interface AdminStory {
  id: string;
  title: string;
  body: string;
  status: ContentStatus;
  author: { id: string; nickname: string };
  createdAt: string;
  fires: number;
  rejectReason: string | null;
}

export type UserFilter = 'all' | 'admins' | 'blocked';

export interface AdminUser extends User {
  xp: number;
  factionId: FactionId;
  storiesCount: number;
  booksSubmitted: number;
  blocked: boolean;
  blockReason: string | null;
}

export interface ListQuery<Status> {
  status?: Status;
  search?: string;
}

/** Що робив адмін — для журналу дій. */
export type AuditAction =
  | 'book.approve'
  | 'book.reject'
  | 'book.update'
  | 'book.hide'
  | 'book.restore'
  | 'book.delete'
  | 'story.approve'
  | 'story.reject'
  | 'story.hide'
  | 'story.restore'
  | 'story.delete'
  | 'user.role'
  | 'user.block'
  | 'user.unblock'
  | 'user.xp'
  | 'broadcast';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  admin: { id: string; nickname: string };
  /** Назва книги / історії, нік користувача або заголовок оголошення */
  target: string;
  /** Причина, нова роль, кількість XP… */
  details: string | null;
  createdAt: string;
}

export type AuditGroup = 'books' | 'stories' | 'users' | 'broadcast';

export interface Broadcast {
  title: string;
  message: string;
}

export type { Role };
