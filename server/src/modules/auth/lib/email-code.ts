import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';

import { env } from '../../../config/env.js';

import type { EmailCodePurpose } from '../../../db/schema.js';

export const CODE_TTL_MS = 15 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;
/** Не частіше одного листа на хвилину для одного користувача й призначення. */
export const RESEND_COOLDOWN_MS = 60 * 1000;

/** «042917» — криптографічно випадковий, із провідними нулями. */
export function generateCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/**
 * HMAC із секретом сервера: навіть маючи дамп бази, 6 цифр не перебереш без ключа.
 * Призначення й користувач входять у підпис — код не підійде для іншої дії чи акаунта.
 */
export function hashCode(code: string, userId: string, purpose: EmailCodePurpose): string {
  return createHmac('sha256', env.CODE_HMAC_SECRET)
    .update(`${purpose}:${userId}:${code}`)
    .digest('hex');
}

/** Порівняння за сталий час — без підказок через тривалість відповіді. */
export function isSameHash(a: string, b: string): boolean {
  return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'));
}
