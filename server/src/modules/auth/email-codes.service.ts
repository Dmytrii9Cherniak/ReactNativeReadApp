import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { emailCodes, type EmailCodePurpose, type User } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { sendMail } from '../../shared/mail/mailer.js';
import {
  CODE_TTL_MS,
  MAX_CODE_ATTEMPTS,
  RESEND_COOLDOWN_MS,
  generateCode,
  hashCode,
  isSameHash,
} from './lib/email-code.js';

const subjects: Record<EmailCodePurpose, string> = {
  verify_email: 'підтвердження пошти',
  reset_password: 'скидання пароля',
};

const activeCodesOf = (userId: string, purpose: EmailCodePurpose) =>
  and(
    eq(emailCodes.userId, userId),
    eq(emailCodes.purpose, purpose),
    isNull(emailCodes.consumedAt),
  );

/**
 * Створює новий код і надсилає лист. Попередні коди того ж призначення стають недійсними.
 * Якщо попередній лист пішов менш ніж хвилину тому — нічого не робить (захист від спаму листами).
 */
export async function issueEmailCode(user: User, purpose: EmailCodePurpose): Promise<void> {
  const latest = await db.query.emailCodes.findFirst({
    where: activeCodesOf(user.id, purpose),
    orderBy: desc(emailCodes.createdAt),
  });

  if (latest && Date.now() - latest.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return;
  }

  const code = generateCode();

  const issued = await db.transaction(async (tx) => {
    await tx
      .update(emailCodes)
      .set({ consumedAt: new Date() })
      .where(activeCodesOf(user.id, purpose));

    const [inserted] = await tx
      .insert(emailCodes)
      .values({
        userId: user.id,
        purpose,
        codeHash: hashCode(code, user.id, purpose),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      })
      .returning({ id: emailCodes.id });

    return inserted;
  });

  try {
    await sendMail({
      to: user.email,
      subject: `${code} — код для ${subjects[purpose]}`,
      text: [
        `Привіт, ${user.name}!`,
        '',
        `Твій код для ${subjects[purpose]}: ${code}`,
        'Він діє 15 хвилин.',
        '',
        'Якщо це був не ти — просто проігноруй цей лист.',
      ].join('\n'),
    });
  } catch (error) {
    // Лист не пішов — код ніхто не отримав. Прибираємо його, інакше хвилинний ліміт
    // заблокує повторну спробу, хоча користувач нічого не отримав.
    if (issued) {
      await db.delete(emailCodes).where(eq(emailCodes.id, issued.id));
    }

    throw error;
  }
}

const invalidCode = () => new HttpError(400, 'invalid_code', 'Невірний або прострочений код');

/** Погашає дійсний код. Невірний код — +1 спроба; після ліміту код не приймається взагалі. */
export async function consumeEmailCode(
  userId: string,
  purpose: EmailCodePurpose,
  code: string,
): Promise<void> {
  const active = await db.query.emailCodes.findFirst({
    where: and(activeCodesOf(userId, purpose), gt(emailCodes.expiresAt, new Date())),
    orderBy: desc(emailCodes.createdAt),
  });

  if (!active || active.attempts >= MAX_CODE_ATTEMPTS) {
    throw invalidCode();
  }

  if (!isSameHash(active.codeHash, hashCode(code, userId, purpose))) {
    await db
      .update(emailCodes)
      .set({ attempts: sql`${emailCodes.attempts} + 1` })
      .where(eq(emailCodes.id, active.id));

    throw invalidCode();
  }

  await db.update(emailCodes).set({ consumedAt: new Date() }).where(eq(emailCodes.id, active.id));
}
