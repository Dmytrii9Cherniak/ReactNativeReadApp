import { randomUUID } from 'node:crypto';

import { and, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../../db/client.js';
import { books, userBooks, type User } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { fileStorage } from '../../shared/storage/file-storage.js';
import { canDeleteBook, canSubmitBook, canViewBook } from './book-access.js';
import { CONTENT_TYPES, detectFormat, hasValidSignature } from './book-file.js';
import { selectBookViews, toBookDto, type BookDto, type BookView } from './books.queries.js';

import type { catalogQuerySchema, createBookSchema } from './books.schemas.js';

/** Немає доступу = «не знайдено»: так не видно навіть сам факт існування чужої книги. */
const bookNotFound = () => new HttpError(404, 'book_not_found', 'Книгу не знайдено');

/** Книга, яку глядач має право бачити, — або 404. */
export async function getViewableBook(viewer: User | null, id: string): Promise<BookView> {
  const [view] = await selectBookViews().where(eq(books.id, id));

  if (!view || !canViewBook(viewer, view)) {
    throw bookNotFound();
  }

  return view;
}

/** `%`, `_` і `\` у пошуку — звичайні символи, а не шаблони LIKE. */
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/** Каталог: лише опубліковані книги, новіші першими. */
export async function listCatalog({ search, limit, offset }: z.infer<typeof catalogQuerySchema>) {
  const conditions: SQL[] = [eq(books.status, 'published')];

  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    const matches = or(ilike(books.title, pattern), ilike(books.author, pattern));

    if (matches) {
      conditions.push(matches);
    }
  }

  // На один рядок більше, ніж просили, — так видно, чи є наступна сторінка
  const rows = await selectBookViews()
    .where(and(...conditions))
    .orderBy(desc(books.createdAt), desc(books.id))
    .limit(limit + 1)
    .offset(offset);

  return {
    items: rows.slice(0, limit).map(toBookDto),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}

export async function getBook(viewer: User | null, id: string): Promise<BookDto> {
  return toBookDto(await getViewableBook(viewer, id));
}

/** Усі книги, завантажені користувачем, у будь-якому статусі. */
export async function listUploads(owner: User): Promise<BookDto[]> {
  const rows = await selectBookViews()
    .where(eq(books.uploadedBy, owner.id))
    .orderBy(desc(books.createdAt));

  return rows.map(toBookDto);
}

/**
 * Завантаження: книга створюється приватною і одразу потрапляє на полицю власника.
 * Публікація в каталог — окремою дією (submit → модерація).
 */
export async function createBook(
  owner: User,
  file: Express.Multer.File,
  input: z.infer<typeof createBookSchema>,
): Promise<BookDto> {
  const format = detectFormat(file.originalname);

  if (!format) {
    throw new HttpError(400, 'unsupported_format', 'Підтримуються лише PDF, EPUB і TXT');
  }

  if (!(await hasValidSignature(file.path, format))) {
    throw new HttpError(400, 'invalid_file', `Вміст файлу не схожий на ${format.toUpperCase()}`);
  }

  const id = randomUUID();
  const fileKey = `books/${id}.${format}`;

  await fileStorage.put(fileKey, file.path);

  try {
    await db.transaction(async (tx) => {
      await tx.insert(books).values({
        id,
        ...input,
        format,
        fileKey,
        fileSize: file.size,
        uploadedBy: owner.id,
      });
      await tx.insert(userBooks).values({ userId: owner.id, bookId: id });
    });
  } catch (error) {
    // Запис у базу не вдався — файл без запису нікому не потрібен
    await fileStorage.remove(fileKey);

    throw error;
  }

  return getBook(owner, id);
}

/** Подати на модерацію (приватну або відхилену після виправлень). */
export async function submitBook(owner: User, id: string): Promise<BookDto> {
  const view = await getViewableBook(owner, id);

  if (!canSubmitBook(owner, view)) {
    throw new HttpError(
      409,
      'invalid_status',
      'Подати можна лише власну приватну або відхилену книгу',
    );
  }

  await db.update(books).set({ status: 'pending', rejectionReason: null }).where(eq(books.id, id));

  return getBook(owner, id);
}

/** Видалення разом з файлом і з усіх полиць (каскад у базі). */
export async function deleteBook(viewer: User, id: string): Promise<void> {
  const view = await getViewableBook(viewer, id);

  if (!canDeleteBook(viewer, view)) {
    throw new HttpError(403, 'forbidden', 'Недостатньо прав');
  }

  const [deleted] = await db
    .delete(books)
    .where(eq(books.id, id))
    .returning({ fileKey: books.fileKey });

  if (deleted) {
    await fileStorage.remove(deleted.fileKey);
  }
}

/** Файл книги для читання / скачування — з тією ж перевіркою доступу. */
export async function openBookFile(viewer: User | null, id: string) {
  const view = await getViewableBook(viewer, id);
  const [book] = await db.select({ fileKey: books.fileKey }).from(books).where(eq(books.id, id));

  if (!book) {
    throw bookNotFound();
  }

  return {
    stream: fileStorage.openRead(book.fileKey),
    contentType: CONTENT_TYPES[view.format],
    fileSize: view.fileSize,
    fileName: `${view.title}.${view.format}`,
  };
}
