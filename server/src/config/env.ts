import { z } from 'zod';

/** Змінні середовища перевіряються при старті: без потрібних сервер не запуститься. */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1),
  /** Origins web-клієнта через кому. Мобільному застосунку CORS не потрібен. */
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:8081')
    .transform((value) => value.split(',').map((origin) => origin.trim())),

  /** Підпис access-токенів (JWT). Згенерувати: npm run secret */
  JWT_ACCESS_SECRET: z.string().min(32),
  /** Ключ HMAC для 6-значних кодів з листів. Згенерувати: npm run secret */
  CODE_HMAC_SECRET: z.string().min(32),

  /** Пошта. За замовчуванням — локальний Mailpit з docker-compose */
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('ReadApp <no-reply@readapp.local>'),

  /** Папка для файлів книг (відносно server/) */
  STORAGE_DIR: z.string().default('storage'),
  MAX_BOOK_SIZE_MB: z.coerce.number().positive().default(50),
});

export const env = envSchema.parse(process.env);
