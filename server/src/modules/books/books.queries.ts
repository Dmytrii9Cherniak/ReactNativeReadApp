import { eq, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { books, userBooks, users } from '../../db/schema.js';

/** Скільки користувачів позначили книгу прочитаною. */
const readCount = sql<number>`(
  select count(*)::int from ${userBooks}
  where ${userBooks.bookId} = ${books.id} and ${userBooks.shelf} = 'read'
)`;

/** Поля книги для відповіді API: сама книга + ім'я того, хто завантажив, + лічильник. */
export const bookViewFields = {
  id: books.id,
  title: books.title,
  author: books.author,
  description: books.description,
  format: books.format,
  fileSize: books.fileSize,
  status: books.status,
  rejectionReason: books.rejectionReason,
  uploadedBy: books.uploadedBy,
  uploaderName: users.name,
  readCount,
  createdAt: books.createdAt,
};

/** select … from books left join users (того, хто завантажив). */
export function selectBookViews() {
  return db.select(bookViewFields).from(books).leftJoin(users, eq(users.id, books.uploadedBy));
}

export type BookView = Awaited<ReturnType<typeof selectBookViews>>[number];

/** Книга у відповіді API. */
export function toBookDto(view: BookView) {
  return {
    id: view.id,
    title: view.title,
    author: view.author,
    description: view.description,
    format: view.format,
    fileSize: view.fileSize,
    status: view.status,
    rejectionReason: view.rejectionReason,
    uploader: view.uploadedBy ? { id: view.uploadedBy, name: view.uploaderName } : null,
    readCount: view.readCount,
    createdAt: view.createdAt.toISOString(),
  };
}

export type BookDto = ReturnType<typeof toBookDto>;
