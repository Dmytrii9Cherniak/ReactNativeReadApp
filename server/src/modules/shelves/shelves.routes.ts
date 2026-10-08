import { Router } from 'express';

import { getAuthUser, requireAuth } from '../auth/require-auth.js';
import { progressSchema, putShelfSchema, shelfBookParamsSchema } from './shelves.schemas.js';
import { listShelf, putOnShelf, removeFromShelf, saveProgress } from './shelves.service.js';

/** Бібліотека поточного користувача: /me/books */
export const shelvesRouter = Router();

shelvesRouter.use(requireAuth);

shelvesRouter.get('/', async (req, res) => {
  res.json(await listShelf(getAuthUser(req)));
});

shelvesRouter.put('/:bookId', async (req, res) => {
  const { bookId } = shelfBookParamsSchema.parse(req.params);
  const { shelf } = putShelfSchema.parse(req.body);

  await putOnShelf(getAuthUser(req), bookId, shelf);
  res.status(204).end();
});

shelvesRouter.put('/:bookId/progress', async (req, res) => {
  const { bookId } = shelfBookParamsSchema.parse(req.params);

  await saveProgress(getAuthUser(req), bookId, progressSchema.parse(req.body));
  res.status(204).end();
});

shelvesRouter.delete('/:bookId', async (req, res) => {
  const { bookId } = shelfBookParamsSchema.parse(req.params);

  await removeFromShelf(getAuthUser(req), bookId);
  res.status(204).end();
});
