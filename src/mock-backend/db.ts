import type { AuditAction, ContentStatus } from '@/features/admin';
import type { Role } from '@/features/auth';
import type { CatalogBook } from '@/features/catalog';
import type { NotificationKind, NotificationParams } from '@/features/notifications';
import type { FactionId } from '@/features/progression';
import type { Shelf } from '@/features/shelves';
import { kvStorage } from '@/shared/lib/kv-storage';

import { createSeed } from './fixtures/seed';

/**
 * «База даних» тестового сервера. Таблиці — ті самі, що будуть у справжній БД
 * (див. docs/API.md): users, books, user_books, stories, story_fires, pending_signups,
 * notifications, audit_log.
 */

export interface DailyCounters {
  /** Доба у форматі YYYY-MM-DD (UTC) */
  day: string;
  story: number;
  fires: number;
  ads: number;
  adXp: number;
}

export interface UserRecord {
  id: string;
  email: string;
  /** Лише в тестовому сервері! Справжній бекенд зберігає хеш (argon2/bcrypt). */
  password: string;
  nickname: string;
  role: Role;
  createdAt: string;
  xp: number;
  factionId: FactionId;
  factionChangedAt: string | null;
  storiesCount: number;
  firesReceived: number;
  nonStopStreak: number;
  nonStopEarned: number;
  lastStoryDay: string | null;
  daily: DailyCounters;
  blocked: boolean;
  blockReason: string | null;
}

export type { ContentStatus };

export interface BookRecord extends CatalogBook {
  status: ContentStatus;
  submittedBy: string | null;
  submittedAt: string;
  rejectReason: string | null;
  /** Тестова книга з згенерованим текстом; завантажені — текст із файлу (book-files.ts) */
  isDemoText: boolean;
}

export interface ShelfRecord {
  userId: string;
  bookId: string;
  shelf: Shelf;
  updatedAt: string;
}

export interface StoryRecord {
  id: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
  status: ContentStatus;
  rejectReason: string | null;
  /** Вогники: по одному з акаунта (таблиця story_fires) */
  fires: { userId: string; at: string }[];
  /** Вогники «з минулого» для тестових історій — щоб цифри були як у макеті */
  baseFires: number;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  kind: NotificationKind;
  params: NotificationParams;
  createdAt: string;
  read: boolean;
}

export interface AuditRecord {
  id: string;
  adminId: string;
  action: AuditAction;
  target: string;
  details: string | null;
  createdAt: string;
}

export interface PendingSignup {
  nickname: string;
  email: string;
  password: string;
}

/** Запит на скидання пароля (справжній бекенд зберігає хеш коду й термін дії). */
export interface PasswordReset {
  email: string;
  requestedAt: string;
}

export interface Db {
  version: number;
  users: UserRecord[];
  books: BookRecord[];
  shelves: ShelfRecord[];
  stories: StoryRecord[];
  pendingSignups: PendingSignup[];
  passwordResets: PasswordReset[];
  notifications: NotificationRecord[];
  audit: AuditRecord[];
  /** Учасники угруповань поза тестовою базою — щоб цифри були «живими» */
  factionBaseMembers: Record<FactionId, number>;
}

/** Змінюється при зміні структури — стара збережена база тоді просто перестворюється. */
const DB_VERSION = 3;
const STORAGE_KEY = 'mock-backend-db';

let db: Db | null = null;
/** Одне завантаження на всі запити: перші запити після запуску йдуть одночасно */
let loading: Promise<Db> | null = null;

/** База зберігається між запусками, тож зареєстровані акаунти й історії не зникають. */
export function getDb(): Promise<Db> {
  if (db) {
    return Promise.resolve(db);
  }

  loading ??= load().then((saved) => {
    db = saved ?? createSeed(DB_VERSION);

    return db;
  });

  return loading;
}

export async function commit(): Promise<void> {
  if (!db) {
    return;
  }

  try {
    await kvStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Не збереглося між запусками — у пам'яті дані актуальні, запит успішний
  }
}

async function load(): Promise<Db | null> {
  try {
    const raw = await kvStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Db) : null;

    return saved?.version === DB_VERSION ? saved : null;
  } catch {
    // Пошкоджена збережена база — починаємо з тестових даних
    return null;
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
