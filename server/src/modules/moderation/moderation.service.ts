import { and, asc, eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { books, type User } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { selectBookViews, toBookDto, type BookDto } from '../books/books.queries.js';
import { getBook } from '../books/books.service.js';

/** Черга модерації: найдовше очікують — першими. */
export async function listPendingBooks(): Promise<BookDto[]> {
  const rows = await selectBookViews()
    .where(eq(books.status, 'pending'))
    .orderBy(asc(books.updatedAt));

  return rows.map(toBookDto);
}

/**
 * Рішення по заявці. Умова status = 'pending' прямо в UPDATE — щоб два модератори
 * не розглянули одну заявку двічі і не можна було «схвалити» чужу приватну книгу.
 */
async function review(
  moderator: User,
  id: string,
  decision: { status: 'published' | 'rejected'; rejectionReason: string | null },
): Promise<BookDto> {
  const [updated] = await db
    .update(books)
    .set({ ...decision, reviewedBy: moderator.id, reviewedAt: new Date() })
    .where(and(eq(books.id, id), eq(books.status, 'pending')))
    .returning({ id: books.id });

  if (!updated) {
    throw new HttpError(404, 'not_pending', 'Книги немає в черзі модерації');
  }

  return getBook(moderator, id);
}

export function approveBook(moderator: User, id: string): Promise<BookDto> {
  return review(moderator, id, { status: 'published', rejectionReason: null });
}

export function rejectBook(moderator: User, id: string, reason: string): Promise<BookDto> {
  return review(moderator, id, { status: 'rejected', rejectionReason: reason });
}
