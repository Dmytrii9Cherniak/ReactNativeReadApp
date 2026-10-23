import type {
  AdminApi,
  AdminBook,
  AdminStory,
  AdminUser,
  AuditAction,
  AuditGroup,
} from '@/features/admin';
import type { FactionId } from '@/features/progression';
import { ApiError } from '@/shared/lib/api-error';

import { logAction, notifyUser } from '../activity';
import { emit, subscribe } from '../events';
import { buildBookParagraphs } from '../fixtures/book-text';
import { toBook, toUser } from '../mappers';
import { respond } from '../respond';
import { DAY_MS } from '../rules';
import { requireAdmin } from '../session';

import type { BookRecord, Db, StoryRecord, UserRecord } from '../db';

const EXCERPT_PARAGRAPHS = 6;
const TOP_USERS = 5;
/** 0.1 XP — найменший крок (вогник дає 0.5) */
const round = (xp: number) => Math.round(xp * 10) / 10;

const AUDIT_GROUPS: Record<AuditGroup, (action: AuditAction) => boolean> = {
  books: (action) => action.startsWith('book.'),
  stories: (action) => action.startsWith('story.'),
  users: (action) => action.startsWith('user.'),
  broadcast: (action) => action === 'broadcast',
};

const matches = (search: string | undefined, ...values: string[]) => {
  const query = search?.trim().toLowerCase();

  return !query || values.some((value) => value.toLowerCase().includes(query));
};

const isWithinWeek = (iso: string) => Date.now() - new Date(iso).getTime() < 7 * DAY_MS;

const findUser = (db: Db, id: string | null) => db.users.find((user) => user.id === id) ?? null;

const authorRef = (db: Db, id: string | null) => {
  const user = findUser(db, id);

  return user ? { id: user.id, nickname: user.nickname } : null;
};

function toAdminBook(db: Db, book: BookRecord): AdminBook {
  return {
    ...toBook(book),
    status: book.status,
    submittedBy: authorRef(db, book.submittedBy),
    submittedAt: book.submittedAt,
    rejectReason: book.rejectReason,
  };
}

function toAdminStory(db: Db, story: StoryRecord): AdminStory {
  return {
    id: story.id,
    title: story.title,
    body: story.body,
    status: story.status,
    author: authorRef(db, story.authorId) ?? { id: story.authorId, nickname: '—' },
    createdAt: story.createdAt,
    fires: story.baseFires + story.fires.length,
    rejectReason: story.rejectReason,
  };
}

function toAdminUser(db: Db, user: UserRecord): AdminUser {
  return {
    ...toUser(user),
    xp: round(user.xp),
    factionId: user.factionId,
    storiesCount: user.storiesCount,
    booksSubmitted: db.books.filter((book) => book.submittedBy === user.id).length,
    blocked: user.blocked,
    blockReason: user.blockReason,
  };
}

function getBook(db: Db, id: string): BookRecord {
  const book = db.books.find((item) => item.id === id);

  if (!book) {
    throw new ApiError('not_found');
  }

  return book;
}

function getStory(db: Db, id: string): StoryRecord {
  const story = db.stories.find((item) => item.id === id);

  if (!story) {
    throw new ApiError('not_found');
  }

  return story;
}

/** Дії над іншим користувачем: себе змінювати не можна (щоб не втратити доступ). */
function getOtherUser(db: Db, admin: UserRecord, id: string): UserRecord {
  if (admin.id === id) {
    throw new ApiError('cannot_modify_self');
  }

  const user = findUser(db, id);

  if (!user) {
    throw new ApiError('not_found');
  }

  return user;
}

const requireReason = (reason: string) => {
  if (!reason.trim()) {
    throw new ApiError('validation');
  }

  return reason.trim();
};

export const adminHandlers: AdminApi = {
  getStats: () =>
    respond((db) => {
      requireAdmin(db);

      const members = new Map<FactionId, number>();

      db.users.forEach((user) =>
        members.set(user.factionId, (members.get(user.factionId) ?? 0) + 1),
      );

      return {
        pendingBooks: db.books.filter((book) => book.status === 'pending').length,
        pendingStories: db.stories.filter((story) => story.status === 'pending').length,
        users: db.users.length,
        blockedUsers: db.users.filter((user) => user.blocked).length,
        newUsersWeek: db.users.filter((user) => isWithinWeek(user.createdAt)).length,
        publishedBooks: db.books.filter((book) => book.status === 'published').length,
        storiesWeek: db.stories.filter((story) => isWithinWeek(story.createdAt)).length,
        firesWeek: db.stories.reduce(
          (sum, story) => sum + story.fires.filter((fire) => isWithinWeek(fire.at)).length,
          0,
        ),
        factions: (Object.keys(db.factionBaseMembers) as FactionId[]).map((id) => ({
          id,
          members: db.factionBaseMembers[id] + (members.get(id) ?? 0),
        })),
        topUsers: [...db.users]
          .filter((user) => !user.blocked)
          .sort((a, b) => b.xp - a.xp)
          .slice(0, TOP_USERS)
          .map((user) => ({
            id: user.id,
            nickname: user.nickname,
            xp: round(user.xp),
            factionId: user.factionId,
          })),
      };
    }),

  // ——— Книги ———

  listBooks: ({ status, search }) =>
    respond((db) => {
      requireAdmin(db);

      return db.books
        .filter(
          (book) => (!status || book.status === status) && matches(search, book.title, book.author),
        )
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
        .map((book) => toAdminBook(db, book));
    }),

  getBook: (id) =>
    respond((db) => {
      requireAdmin(db);

      const book = getBook(db, id);

      return {
        ...toAdminBook(db, book),
        // Розбір файлу — справа бекенду; тут початок тестового тексту
        excerpt: buildBookParagraphs(book).slice(0, EXCERPT_PARAGRAPHS),
      };
    }),

  updateBook: (id, patch) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const book = getBook(db, id);
      const title = patch.title?.trim() ?? book.title;
      const author = patch.author?.trim() ?? book.author;

      if (!title || !author) {
        throw new ApiError('validation');
      }

      Object.assign(book, {
        title,
        author,
        description: patch.description?.trim() ?? book.description,
        language: patch.language ?? book.language,
      });
      logAction(db, admin, 'book.update', book.title);

      return toAdminBook(db, book);
    }),

  approveBook: (id) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const book = getBook(db, id);

      book.status = 'published';
      book.rejectReason = null;
      logAction(db, admin, 'book.approve', book.title);

      if (book.submittedBy) {
        notifyUser(db, book.submittedBy, 'book_approved', { title: book.title });
      }

      emit('admin');

      return toAdminBook(db, book);
    }),

  rejectBook: (id, reason) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const book = getBook(db, id);
      const text = requireReason(reason);

      book.status = 'rejected';
      book.rejectReason = text;
      logAction(db, admin, 'book.reject', book.title, text);

      if (book.submittedBy) {
        notifyUser(db, book.submittedBy, 'book_rejected', { title: book.title, text });
      }

      emit('admin');

      return toAdminBook(db, book);
    }),

  setBookHidden: (id, hidden) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const book = getBook(db, id);

      book.status = hidden ? 'hidden' : 'published';
      logAction(db, admin, hidden ? 'book.hide' : 'book.restore', book.title);

      return toAdminBook(db, book);
    }),

  deleteBook: (id) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const book = getBook(db, id);

      db.books = db.books.filter((item) => item !== book);
      db.shelves = db.shelves.filter((shelf) => shelf.bookId !== id);
      logAction(db, admin, 'book.delete', book.title);
      emit('admin');
    }),

  // ——— Історії ———

  listStories: ({ status, search }) =>
    respond((db) => {
      requireAdmin(db);

      return db.stories
        .filter(
          (story) =>
            (!status || story.status === status) &&
            matches(search, story.title, findUser(db, story.authorId)?.nickname ?? ''),
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((story) => toAdminStory(db, story));
    }),

  approveStory: (id) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const story = getStory(db, id);

      story.status = 'published';
      story.rejectReason = null;
      logAction(db, admin, 'story.approve', story.title);
      notifyUser(db, story.authorId, 'story_approved', { title: story.title });
      emit('admin');

      return toAdminStory(db, story);
    }),

  rejectStory: (id, reason) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const story = getStory(db, id);
      const text = requireReason(reason);

      story.status = 'rejected';
      story.rejectReason = text;
      logAction(db, admin, 'story.reject', story.title, text);
      notifyUser(db, story.authorId, 'story_rejected', { title: story.title, text });
      emit('admin');

      return toAdminStory(db, story);
    }),

  setStoryHidden: (id, hidden) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const story = getStory(db, id);

      story.status = hidden ? 'hidden' : 'published';
      logAction(db, admin, hidden ? 'story.hide' : 'story.restore', story.title);

      return toAdminStory(db, story);
    }),

  deleteStory: (id) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const story = getStory(db, id);

      db.stories = db.stories.filter((item) => item !== story);
      logAction(db, admin, 'story.delete', story.title);
      emit('admin');
    }),

  // ——— Користувачі ———

  listUsers: ({ filter = 'all', search }) =>
    respond((db) => {
      requireAdmin(db);

      return db.users
        .filter(
          (user) =>
            (filter === 'all' ||
              (filter === 'admins' && user.role === 'admin') ||
              (filter === 'blocked' && user.blocked)) &&
            matches(search, user.nickname, user.email),
        )
        .sort((a, b) => Number(b.role === 'admin') - Number(a.role === 'admin') || b.xp - a.xp)
        .map((user) => toAdminUser(db, user));
    }),

  getUser: (id) =>
    respond((db) => {
      requireAdmin(db);

      const user = findUser(db, id);

      if (!user) {
        throw new ApiError('not_found');
      }

      return toAdminUser(db, user);
    }),

  setRole: (id, role) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const user = getOtherUser(db, admin, id);

      user.role = role;
      logAction(db, admin, 'user.role', user.nickname, role);
      notifyUser(db, user.id, 'role_changed', { role });

      return toAdminUser(db, user);
    }),

  blockUser: (id, reason) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const user = getOtherUser(db, admin, id);
      const text = requireReason(reason);

      // Справжній бекенд тут ще й відкликає всі сесії користувача
      user.blocked = true;
      user.blockReason = text;
      logAction(db, admin, 'user.block', user.nickname, text);

      return toAdminUser(db, user);
    }),

  unblockUser: (id) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const user = getOtherUser(db, admin, id);

      user.blocked = false;
      user.blockReason = null;
      logAction(db, admin, 'user.unblock', user.nickname);

      return toAdminUser(db, user);
    }),

  adjustXp: (id, amount, reason) =>
    respond((db) => {
      const admin = requireAdmin(db);
      const user = getOtherUser(db, admin, id);
      const text = requireReason(reason);

      if (!Number.isFinite(amount) || amount === 0) {
        throw new ApiError('validation');
      }

      // Досвід не може стати від'ємним
      const applied = round(Math.max(-user.xp, amount));

      user.xp = round(user.xp + applied);
      logAction(
        db,
        admin,
        'user.xp',
        user.nickname,
        `${applied > 0 ? '+' : ''}${applied} XP · ${text}`,
      );
      notifyUser(db, user.id, 'xp_adjusted', { amount: applied, text });

      return toAdminUser(db, user);
    }),

  // ——— Оголошення й журнал ———

  broadcast: ({ title, message }) =>
    respond((db) => {
      const admin = requireAdmin(db);

      if (!title.trim() || !message.trim()) {
        throw new ApiError('validation');
      }

      db.users
        .filter((user) => !user.blocked)
        .forEach((user) =>
          notifyUser(db, user.id, 'announcement', { title: title.trim(), text: message.trim() }),
        );
      logAction(db, admin, 'broadcast', title.trim());
    }),

  listAudit: (group) =>
    respond((db) => {
      requireAdmin(db);

      return db.audit
        .filter((entry) => !group || AUDIT_GROUPS[group](entry.action))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((entry) => ({
          id: entry.id,
          action: entry.action,
          admin: authorRef(db, entry.adminId) ?? { id: entry.adminId, nickname: '—' },
          target: entry.target,
          details: entry.details,
          createdAt: entry.createdAt,
        }));
    }),

  subscribe: (listener) => subscribe('admin', listener),
};
