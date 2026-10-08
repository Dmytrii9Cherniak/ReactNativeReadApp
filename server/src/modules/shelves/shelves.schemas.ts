import { z } from 'zod';

import { readingLocationSchema } from '../../shared/reading-location.js';

export const shelfBookParamsSchema = z.object({ bookId: z.uuid('Некоректний id книги') });

export const putShelfSchema = z.object({
  shelf: z.enum(['watchlist', 'reading', 'read']),
});

export const progressSchema = z.object({
  location: readingLocationSchema,
  fraction: z.number().min(0).max(1),
  furthestPages: z.number().min(0).optional(),
});
