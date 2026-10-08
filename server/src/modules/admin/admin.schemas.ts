import { z } from 'zod';

export const userIdParamsSchema = z.object({ id: z.uuid('Некоректний id') });

/** Можна змінити одне або кілька прав за раз. */
export const permissionsSchema = z
  .object({
    isAdmin: z.boolean(),
    canModerateBooks: z.boolean(),
    canModerateStories: z.boolean(),
  })
  .partial()
  .refine((changes) => Object.keys(changes).length > 0, 'Не вказано жодного права');
