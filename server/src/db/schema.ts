import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import type { ReadingLocation } from '../shared/reading-location.js';

const timestampTz = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Завжди в нижньому регістрі — сервер нормалізує перед записом і пошуком */
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  /** null — пошту ще не підтверджено */
  emailVerifiedAt: timestampTz('email_verified_at'),
  /** Права: адмін керує правами інших; модератори — книгами / історіями */
  isAdmin: boolean('is_admin').notNull().default(false),
  canModerateBooks: boolean('can_moderate_books').notNull().default(false),
  canModerateStories: boolean('can_moderate_stories').notNull().default(false),
  createdAt: timestampTz('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;

/** Сесії: refresh-токен живе довго, у базі — лише його SHA-256. */
export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: timestampTz('expires_at').notNull(),
    /** Відкликаний: вихід або вже використаний при оновленні (ротація) */
    revokedAt: timestampTz('revoked_at'),
    createdAt: timestampTz('created_at').notNull().defaultNow(),
  },
  (table) => [index('refresh_tokens_user_id_idx').on(table.userId)],
);

export const emailCodePurpose = pgEnum('email_code_purpose', ['verify_email', 'reset_password']);

/** 6-значні коди з листів. Код у базі не зберігається — лише його HMAC. */
export const emailCodes = pgTable(
  'email_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    purpose: emailCodePurpose('purpose').notNull(),
    codeHash: text('code_hash').notNull(),
    /** Невдалі спроби введення — після ліміту код більше не приймається */
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestampTz('expires_at').notNull(),
    consumedAt: timestampTz('consumed_at'),
    createdAt: timestampTz('created_at').notNull().defaultNow(),
  },
  (table) => [index('email_codes_user_purpose_idx').on(table.userId, table.purpose)],
);

export type EmailCodePurpose = (typeof emailCodePurpose.enumValues)[number];

/* ---------------------------------- Книги ---------------------------------- */

export const bookFormat = pgEnum('book_format', ['pdf', 'epub', 'txt']);

/**
 * Життєвий цикл книги (хто що бачить — modules/books/book-access.ts):
 *   private ──подати──▶ pending ──схвалити──▶ published
 *                          └──відхилити──▶ rejected ──подати знову──▶ pending
 */
export const bookStatus = pgEnum('book_status', ['private', 'pending', 'published', 'rejected']);

export const books = pgTable(
  'books',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    author: text('author'),
    description: text('description'),
    format: bookFormat('format').notNull(),
    /** Ключ файлу у сховищі (shared/storage) — не шлях на диску */
    fileKey: text('file_key').notNull().unique(),
    fileSize: integer('file_size').notNull(),
    status: bookStatus('status').notNull().default('private'),
    /** Хто завантажив. null — акаунт видалено, а опублікована книга лишилась у каталозі */
    uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    /** Хто й коли останнім розглянув на модерації */
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestampTz('reviewed_at'),
    /** Причина відхилення — бачить власник, щоб виправити й подати знову */
    rejectionReason: text('rejection_reason'),
    createdAt: timestampTz('created_at').notNull().defaultNow(),
    updatedAt: timestampTz('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('books_status_created_at_idx').on(table.status, table.createdAt),
    index('books_uploaded_by_idx').on(table.uploadedBy),
  ],
);

export type Book = typeof books.$inferSelect;
export type BookFormat = (typeof bookFormat.enumValues)[number];
export type BookStatus = (typeof bookStatus.enumValues)[number];

/* ---------------------------- Полиці користувачів ---------------------------- */

export const shelf = pgEnum('shelf', ['watchlist', 'reading', 'read']);

/**
 * Книги в бібліотеці користувача — зв'язок «багато до багатьох» users ↔ books.
 * Одна книга може бути в багатьох користувачів; у кожного своя полиця й прогрес.
 */
export const userBooks = pgTable(
  'user_books',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    bookId: uuid('book_id')
      .notNull()
      .references(() => books.id, { onDelete: 'cascade' }),
    shelf: shelf('shelf').notNull().default('watchlist'),
    /** Позиція читання у форматі застосунку; null — ще не відкривав */
    location: jsonb('location').$type<ReadingLocation>(),
    /** Прочитана частка 0..1 */
    fraction: real('fraction').notNull().default(0),
    /** Найдальша позиція в умовних сторінках — для статистики */
    furthestPages: real('furthest_pages'),
    addedAt: timestampTz('added_at').notNull().defaultNow(),
    updatedAt: timestampTz('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.bookId] }),
    // Лічильник «прочитано разів» і видалення книги шукають за book_id
    index('user_books_book_id_shelf_idx').on(table.bookId, table.shelf),
  ],
);

export type Shelf = (typeof shelf.enumValues)[number];
