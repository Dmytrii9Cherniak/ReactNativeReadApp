import { HttpError } from '../../shared/http/errors.js';
import { findUserById } from '../users/users.repository.js';
import { verifyAccessToken } from './lib/access-token.js';

import type { User } from '../../db/schema.js';
import type { Request, RequestHandler } from 'express';

const invalidToken = () => new HttpError(401, 'invalid_token', 'Сесія недійсна або закінчилась');

/** Користувач за `Authorization: Bearer <accessToken>`; null — заголовка немає. */
async function authenticate(req: Request): Promise<User | null> {
  const header = req.get('authorization');

  if (!header) {
    return null;
  }

  if (!header.startsWith('Bearer ')) {
    throw invalidToken();
  }

  // Користувач читається з бази на кожен запит — зміна прав діє одразу, без перевипуску токена
  const user = await findUserById(await verifyAccessToken(header.slice('Bearer '.length)));

  if (!user) {
    throw invalidToken();
  }

  return user;
}

/** Гард: пускає лише з дійсним токеном (інакше 401). */
export const requireAuth: RequestHandler = async (req, _res, next) => {
  const user = await authenticate(req);

  if (!user) {
    throw new HttpError(401, 'unauthorized', 'Потрібна авторизація');
  }

  req.user = user;
  next();
};

/**
 * Для маршрутів, відкритих і гостям (каталог, файл опублікованої книги): токен необов'язковий,
 * але якщо переданий — має бути дійсним (тоді клієнт оновить сесію і повторить запит).
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  req.user = (await authenticate(req)) ?? undefined;
  next();
};

/** Користувач у роуті після requireAuth. */
export function getAuthUser(req: Request): User {
  if (!req.user) {
    throw new Error('getAuthUser викликано без requireAuth');
  }

  return req.user;
}
