import { z } from 'zod';

export const rejectSchema = z.object({
  reason: z.string().trim().min(1, 'Вкажи причину').max(1000, 'Не більше 1000 символів'),
});
