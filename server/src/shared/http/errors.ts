import { ZodError } from 'zod';

import type { ErrorRequestHandler, RequestHandler } from 'express';

/** Очікувана помилка з HTTP-статусом і кодом, який клієнт може обробити. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new HttpError(404, 'not_found', 'Маршрут не знайдено'));
};

/** Єдиний формат помилок API: `{ error: { code, message } }`. */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: { code: error.code, message: error.message } });

    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'validation_error',
        message: 'Некоректні дані',
        issues: error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
      },
    });

    return;
  }

  // Невалідний JSON у тілі запиту (express.json)
  if (error instanceof SyntaxError && 'body' in error) {
    res.status(400).json({ error: { code: 'invalid_json', message: 'Некоректний JSON' } });

    return;
  }

  console.error(error);
  res.status(500).json({ error: { code: 'internal_error', message: 'Внутрішня помилка сервера' } });
};
