import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from './config/env.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { booksRouter } from './modules/books/books.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { moderationRouter } from './modules/moderation/moderation.routes.js';
import { shelvesRouter } from './modules/shelves/shelves.routes.js';
import { meRouter } from './modules/users/users.routes.js';
import { errorHandler, notFoundHandler } from './shared/http/errors.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRouter);
  app.use('/auth', authRouter);
  // /me/books — до /me, щоб не плутати з профілем
  app.use('/me/books', shelvesRouter);
  app.use('/me', meRouter);
  app.use('/books', booksRouter);
  app.use('/moderation', moderationRouter);
  app.use('/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
