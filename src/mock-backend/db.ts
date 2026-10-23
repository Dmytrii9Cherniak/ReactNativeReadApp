import type { Role } from '@/features/auth';
import type { CatalogBook } from '@/features/catalog';
import type { FactionId } from '@/features/progression';
import type { Shelf } from '@/features/shelves';
import { kvStorage } from '@/shared/lib/kv-storage';

import { createSeed } from './fixtures/seed';

/**
 * «База даних» тестового сервера. Таблиці — ті самі, що будуть у справжній БД
 * (див. docs/API.md): users, books, shelves, stories, story_fires, pending_signups.
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
}

export type ContentStatus = 'pending' | 'published';

export interface BookRecord extends CatalogBook {
  status: ContentStatus;
  submittedBy: string | null;
  submittedAt: string;
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
  /** Хто запалив вогник (по одному з акаунта) */
  firedBy: string[];
  /** Вогники «з минулого» для тестових історій — щоб цифри були як у макеті */
  baseFires: number;
}

export interface PendingSignup {
  nickname: string;
  email: string;
  password: string;
}

export interface Db {
  version: number;
  users: UserRecord[];
  books: BookRecord[];
  shelves: ShelfRecord[];
  stories: StoryRecord[];
  pendingSignups: PendingSignup[];
  /** Учасники угруповань поза тестовою базою — щоб цифри були «живими» */
  factionBaseMembers: Record<FactionId, number>;
}

/** Змінюється при зміні структури — стара збережена база тоді просто перестворюється. */
const DB_VERSION = 1;
const STORAGE_KEY = 'mock-backend-db';

let db: Db | null = null;

/** База зберігається між запусками, тож зареєстровані акаунти й історії не зникають. */
export async function getDb(): Promise<Db> {
  if (db) {
    return db;
  }

  db = (await load()) ?? createSeed(DB_VERSION);

  return db;
}

export async function commit(): Promise<void> {
  if (db) {
    await kvStorage.setItem(STORAGE_KEY, JSON.stringify(db));
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
