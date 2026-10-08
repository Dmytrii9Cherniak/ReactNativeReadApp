import { z } from 'zod';

/**
 * Місце в книзі — той самий формат, що `ReadingLocation` у застосунку
 * (src/features/library/types.ts): сторінка PDF, CFI для EPUB, рядок TXT.
 */
export const readingLocationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('page'),
    page: z.number().int().min(1),
    pageCount: z.number().int().min(1),
  }),
  z.object({ type: z.literal('cfi'), cfi: z.string().min(1).max(1000) }),
  z.object({ type: z.literal('line'), line: z.number().int().min(0) }),
]);

export type ReadingLocation = z.infer<typeof readingLocationSchema>;
