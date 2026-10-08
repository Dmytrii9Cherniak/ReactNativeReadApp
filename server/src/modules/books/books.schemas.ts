import { z } from 'zod';

/** Порожній рядок з форми → undefined (поле не заповнене). */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Не більше ${max} символів`)
    .transform((value) => value || undefined)
    .optional();

/** Текстові поля multipart-форми завантаження (файл — окремо, у полі `file`). */
export const createBookSchema = z.object({
  title: z.string().trim().min(1, 'Вкажи назву').max(200, 'Назва — не більше 200 символів'),
  author: optionalText(200),
  description: optionalText(5000),
});

export const bookIdParamsSchema = z.object({ id: z.uuid('Некоректний id книги') });

export const catalogQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
