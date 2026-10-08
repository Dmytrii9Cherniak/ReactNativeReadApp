import { Router } from 'express';

import { getAuthUser, requireAuth } from '../auth/require-auth.js';
import { requirePermission } from '../auth/require-permission.js';
import { bookIdParamsSchema } from '../books/books.schemas.js';
import { rejectSchema } from './moderation.schemas.js';
import { approveBook, listPendingBooks, rejectBook } from './moderation.service.js';

export const moderationRouter = Router();

// Модератори книг і адміни (адмін має всі права)
moderationRouter.use(requireAuth, requirePermission('canModerateBooks'));

moderationRouter.get('/books', async (_req, res) => {
  res.json(await listPendingBooks());
});

moderationRouter.post('/books/:id/approve', async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);

  res.json(await approveBook(getAuthUser(req), id));
});

moderationRouter.post('/books/:id/reject', async (req, res) => {
  const { id } = bookIdParamsSchema.parse(req.params);
  const { reason } = rejectSchema.parse(req.body);

  res.json(await rejectBook(getAuthUser(req), id, reason));
});
