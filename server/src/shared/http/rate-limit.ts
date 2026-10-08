import { rateLimit } from 'express-rate-limit';

import { HttpError } from './errors.js';

/** Ліміт запитів з однієї IP; перевищення — 429 у нашому форматі помилок. */
export function createRateLimit({ windowMs, limit }: { windowMs: number; limit: number }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new HttpError(429, 'too_many_requests', 'Забагато запитів — спробуй за кілька хвилин'));
    },
  });
}
