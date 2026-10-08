import { rm } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';

import { Router } from 'express';

import { HttpError } from '../../shared/http/errors.js';
import { createRateLimit } from '../../shared/http/rate-limit.js';
import { getAuthUser, optionalAuth, requireAuth } from '../auth/require-auth.js';
import { receiveBookFile } from './book-file.js';
import { bookIdParamsSchema, catalogQuerySchema, createBookSchema } from './books.schemas.js';
import {
  createBook,
  deleteBook,
  getBook,
  listCatalog,
  listUploads,
  openBookFile,
  submitBook,
} from './books.service.js';

const uploadRateLimit = createRateLimit({ windowMs: 60 * 60 * 1000, limit: 30 });

export const booksRouter = Router();

/** Каталог опублікованих книг — відкритий і для гостей. */
booksRouter.get('/', async (req, res) => {
  res.json(await listCatalog(catalogQuerySchema.parse(req.query)));
});

/** Мої завантаження в будь-якому статусі. Оголошено до /:id, щоб «uploads» не сприйнялось як id. */
booksRouter.get('/uploads', requireAuth, async (req, res) => {
  res.json(await listUploads(getAuthUser(req)));
});

booksRouter.post('/', uploadRateLimit, requireAuth, receiveBookFile, async (req, res) => {
  const { file } = req;

  try {
    if (!file) {
      throw new HttpError(400, 'file_required', 'Додай файл книги (поле file)');
    }

    const input = createBookSchema.parse(req.body);

    res.status(201).json(await createBook(getAuthUser(req), file, input));
  } finally {
    // Тимчасовий файл multer: у сховище вже скопійовано або завантаження відхилено
    if (file) {
      await rm(file.path, { force: true });
    }
  }
});

booksRouter.get('/:id', optionalAuth, async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);

  res.json(await getBook(req.user ?? null, id));
});

/** Файл книги. Content-Disposition — щоб браузер зберіг файл під назвою книги. */
booksRouter.get('/:id/file', optionalAuth, async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);
  const file = await openBookFile(req.user ?? null, id);

  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Length', String(file.fileSize));
  res.setHeader(
    'Content-Disposition',
    `attachment; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
  );

  await pipeline(file.stream, res);
});

booksRouter.post('/:id/submit', requireAuth, async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);

  res.json(await submitBook(getAuthUser(req), id));
});

booksRouter.delete('/:id', requireAuth, async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);

  await deleteBook(getAuthUser(req), id);
  res.status(204).end();
});
