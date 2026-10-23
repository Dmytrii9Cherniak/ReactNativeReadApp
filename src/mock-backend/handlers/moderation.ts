import type { ModerationApi, ModerationItem, ModerationKind } from '@/features/moderation';
import { ApiError } from '@/shared/lib/api-error';

import { respond } from '../respond';
import { STAFF_ROLES, requireRole } from '../session';

import type { BookRecord, Db, StoryRecord } from '../db';

const nicknameOf = (db: Db, userId: string | null) =>
  db.users.find((user) => user.id === userId)?.nickname ?? '—';

function pendingRecords(db: Db, kind: ModerationKind): (BookRecord | StoryRecord)[] {
  const records = kind === 'book' ? db.books : db.stories;

  return records.filter((record) => record.status === 'pending');
}

function toItem(db: Db, kind: ModerationKind, record: BookRecord | StoryRecord): ModerationItem {
  return 'authorId' in record
    ? {
        id: record.id,
        kind,
        title: record.title,
        author: nicknameOf(db, record.authorId),
        submittedBy: nicknameOf(db, record.authorId),
        submittedAt: record.createdAt,
      }
    : {
        id: record.id,
        kind,
        title: record.title,
        author: record.author,
        submittedBy: nicknameOf(db, record.submittedBy),
        submittedAt: record.submittedAt,
      };
}

function findPending(db: Db, kind: ModerationKind, id: string) {
  const record = pendingRecords(db, kind).find((item) => item.id === id);

  if (!record) {
    throw new ApiError('not_found');
  }

  return record;
}

export const moderationHandlers: ModerationApi = {
  list: (kind) =>
    respond((db) => {
      requireRole(db, STAFF_ROLES);

      return pendingRecords(db, kind)
        .map((record) => toItem(db, kind, record))
        .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
    }),

  approve: (kind, id) =>
    respond((db) => {
      requireRole(db, STAFF_ROLES);
      findPending(db, kind, id).status = 'published';
    }),

  reject: (kind, id) =>
    respond((db) => {
      requireRole(db, STAFF_ROLES);

      const record = findPending(db, kind, id);

      if (kind === 'book') {
        db.books = db.books.filter((book) => book !== record);
      } else {
        db.stories = db.stories.filter((story) => story !== record);
      }
    }),
};
