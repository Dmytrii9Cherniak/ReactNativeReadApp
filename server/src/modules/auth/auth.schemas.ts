import { z } from 'zod';

/** Пошта нормалізується тут — далі в коді вона завжди в нижньому регістрі. */
const email = z.string().trim().toLowerCase().pipe(z.email('Некоректна пошта'));
const password = z
  .string()
  .min(8, 'Пароль — щонайменше 8 символів')
  .max(128, 'Пароль — не більше 128 символів');
const code = z.string().regex(/^\d{6}$/, 'Код — 6 цифр');

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Вкажи ім'я").max(50, "Ім'я — не більше 50 символів"),
  email,
  password,
  acceptTerms: z.literal(true, 'Потрібна згода з умовами використання'),
});

export const verifyEmailSchema = z.object({ email, code });

export const emailOnlySchema = z.object({ email });

export const loginSchema = z.object({ email, password: z.string().min(1, 'Вкажи пароль') });

export const resetPasswordSchema = z.object({ email, code, password });

export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
