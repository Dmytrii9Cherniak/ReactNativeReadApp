import type { ShelfEntry, ShelvesApi } from '@/features/shelves';
import { ApiError } from '@/shared/lib/api-error';

import { toBook } from '../mappers';
import { respond } from '../respond';
import { requireUser } from '../session';

import type { Db, ShelfRecord } from '../db';

function toEntry(db: Db, record: ShelfRecord): ShelfEntry | null {
  const book = db.books.find((item) => item.id === record.bookId && item.status === 'published');

  return book ? { book: toBook(book), shelf: record.shelf, updatedAt: record.updatedAt } : null;
}

export const shelvesHandlers: ShelvesApi = {
  list: () =>
    respond((db) => {
      const user = requireUser(db);

      return db.shelves
        .filter((record) => record.userId === user.id)
        .flatMap((record) => toEntry(db, record) ?? []);
    }),

  put: (bookId, shelf) =>
    respond((db) => {
      const user = requireUser(db);
      const record: ShelfRecord = {
        userId: user.id,
        bookId,
        shelf,
        updatedAt: new Date().toISOString(),
      };
      const entry = toEntry(db, record);

      if (!entry) {
        throw new ApiError('not_found');
      }

      db.shelves = [
        ...db.shelves.filter((item) => !(item.userId === user.id && item.bookId === bookId)),
        record,
      ];

      return entry;
    }),

  remove: (bookId) =>
    respond((db) => {
      const user = requireUser(db);

      db.shelves = db.shelves.filter(
        (item) => !(item.userId === user.id && item.bookId === bookId),
      );
    }),
};
