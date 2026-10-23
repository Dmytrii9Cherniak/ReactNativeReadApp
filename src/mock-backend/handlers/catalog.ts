import type { CatalogApi } from '@/features/catalog';
import { ApiError } from '@/shared/lib/api-error';

import { loadContent } from '../book-files';
import { toBook } from '../mappers';
import { respond } from '../respond';

import type { BookRecord, Db } from '../db';

function findPublished(db: Db, id: string): BookRecord {
  const book = db.books.find((item) => item.id === id && item.status === 'published');

  if (!book) {
    throw new ApiError('not_found');
  }

  return book;
}

export const catalogHandlers: CatalogApi = {
  listBooks: ({ search, limit, offset }) =>
    respond((db) => {
      const query = search?.trim().toLowerCase();
      const matches = db.books.filter(
        (book) =>
          book.status === 'published' &&
          (!query ||
            book.title.toLowerCase().includes(query) ||
            book.author.toLowerCase().includes(query)),
      );
      const end = offset + limit;

      return {
        items: matches.slice(offset, end).map(toBook),
        total: matches.length,
        nextOffset: end < matches.length ? end : null,
      };
    }),

  getBook: (id) => respond((db) => toBook(findPublished(db, id))),

  getContent: async (id) => loadContent(await respond((db) => findPublished(db, id))),
};
