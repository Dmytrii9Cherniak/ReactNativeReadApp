import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { findUserByEmail } from '../users/users.repository.js';
import { consumeEmailCode, issueEmailCode } from './email-codes.service.js';
import { hashPassword, verifyPassword } from './lib/password.js';
import { createSession, revokeAllSessions, type Session } from './sessions.service.js';

import type {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from './auth.schemas.js';

/**
 * Реєстрація: акаунт створюється непідтвердженим, на пошту йде код.
 * Повторна реєстрація на непідтверджену пошту оновлює ім'я й пароль і надсилає новий код.
 */
export async function register({
  name,
  email,
  password,
}: z.infer<typeof registerSchema>): Promise<void> {
  const existing = await findUserByEmail(email);

  if (existing?.emailVerifiedAt) {
    throw new HttpError(409, 'email_taken', 'Акаунт з цією поштою вже існує');
  }

  const passwordHash = await hashPassword(password);

  const [user] = existing
    ? await db
        .update(users)
        .set({ name, passwordHash })
        .where(eq(users.id, existing.id))
        .returning()
    : await db.insert(users).values({ name, email, passwordHash }).returning();

  if (!user) {
    throw new Error('Не вдалося зберегти користувача');
  }

  await issueEmailCode(user, 'verify_email');
}

/** Підтвердження пошти кодом — одразу з входом. */
export async function verifyEmail({
  email,
  code,
}: z.infer<typeof verifyEmailSchema>): Promise<Session> {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new HttpError(400, 'invalid_code', 'Невірний або прострочений код');
  }

  await consumeEmailCode(user.id, 'verify_email', code);

  const [verified] = await db
    .update(users)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning();

  return createSession(verified ?? user);
}

/** Відповідь однакова, чи є така пошта, чи ні — щоб не можна було перевіряти чужі адреси. */
export async function resendVerification({ email }: z.infer<typeof emailOnlySchema>) {
  const user = await findUserByEmail(email);

  if (user && !user.emailVerifiedAt) {
    await issueEmailCode(user, 'verify_email');
  }
}

/** Хеш-заглушка: перевірка пароля триває однаково, чи є користувач, чи ні. */
let dummyHash: Promise<string> | undefined;

function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword('timing-equalizer-password');

  return dummyHash;
}

export async function login({ email, password }: z.infer<typeof loginSchema>): Promise<Session> {
  const user = await findUserByEmail(email);
  const isValid = await verifyPassword(user?.passwordHash ?? (await getDummyHash()), password);

  if (!user || !isValid) {
    throw new HttpError(401, 'invalid_credentials', 'Невірна пошта або пароль');
  }

  if (!user.emailVerifiedAt) {
    await issueEmailCode(user, 'verify_email');

    throw new HttpError(
      403,
      'email_not_verified',
      'Пошту не підтверджено — ми надіслали новий код',
    );
  }

  return createSession(user);
}

/** Як і resendVerification — однакова відповідь для будь-якої пошти. */
export async function forgotPassword({ email }: z.infer<typeof emailOnlySchema>) {
  const user = await findUserByEmail(email);

  if (user?.emailVerifiedAt) {
    await issueEmailCode(user, 'reset_password');
  }
}

/** Новий пароль за кодом з листа. Усі старі сесії завершуються, видається нова. */
export async function resetPassword({
  email,
  code,
  password,
}: z.infer<typeof resetPasswordSchema>): Promise<Session> {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new HttpError(400, 'invalid_code', 'Невірний або прострочений код');
  }

  await consumeEmailCode(user.id, 'reset_password', code);
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(users.id, user.id));
  await revokeAllSessions(user.id);

  return createSession(user);
}
