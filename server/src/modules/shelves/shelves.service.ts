import { and, desc, eq, or, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../../db/client.js';
import { books, userBooks, users, type Shelf, type User } from '../../db/schema.js';
import { bookViewFields, toBookDto } from '../books/books.queries.js';
import { getViewableBook } from '../books/books.service.js';

import type { progressSchema } from './shelves.schemas.js';

/** Бібліотека користувача: книги з полицею й прогресом, нещодавно змінені — першими. */
export async function listShelf(user: User) {
  const rows = await db
    .select({
      book: bookViewFields,
      shelf: userBooks.shelf,
      location: userBooks.location,
      fraction: userBooks.fraction,
      furthestPages: userBooks.furthestPages,
      updatedAt: userBooks.updatedAt,
    })
    .from(userBooks)
    .innerJoin(books, eq(books.id, userBooks.bookId))
    .leftJoin(users, eq(users.id, books.uploadedBy))
    .where(
      and(
        eq(userBooks.userId, user.id),
        // Лише книги, які користувач досі може бачити: опубліковані або власні
        or(eq(books.status, 'published'), eq(books.uploadedBy, user.id)),
      ),
    )
    .orderBy(desc(userBooks.updatedAt));

  return rows.map(({ book, updatedAt, ...entry }) => ({
    ...entry,
    book: toBookDto(book),
    updatedAt: updatedAt.toISOString(),
  }));
}

/** Додати книгу на полицю або перекласти на іншу. */
export async function putOnShelf(user: User, bookId: string, shelf: Shelf): Promise<void> {
  await getViewableBook(user, bookId);

  await db
    .insert(userBooks)
    .values({ userId: user.id, bookId, shelf })
    .onConflictDoUpdate({ target: [userBooks.userId, userBooks.bookId], set: { shelf } });
}

/**
 * Прогрес читання. Якщо книги ще немає в бібліотеці — вона додається на полицю «Читаю».
 * furthestPages лише зростає: повернення назад не зменшує прочитане.
 */
export async function saveProgress(
  user: User,
  bookId: string,
  { location, fraction, furthestPages }: z.infer<typeof progressSchema>,
): Promise<void> {
  await getViewableBook(user, bookId);

  await db
    .insert(userBooks)
    .values({ userId: user.id, bookId, shelf: 'reading', location, fraction, furthestPages })
    .onConflictDoUpdate({
      target: [userBooks.userId, userBooks.bookId],
      set: {
        location,
        fraction,
        // greatest() у PostgreSQL ігнорує null
        furthestPages: sql`greatest(${userBooks.furthestPages}, ${furthestPages ?? null})`,
      },
    });
}

export async function removeFromShelf(user: User, bookId: string): Promise<void> {
  await db
    .delete(userBooks)
    .where(and(eq(userBooks.userId, user.id), eq(userBooks.bookId, bookId)));
}
