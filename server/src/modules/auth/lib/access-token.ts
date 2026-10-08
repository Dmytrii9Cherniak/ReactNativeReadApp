import { SignJWT, jwtVerify } from 'jose';

import { env } from '../../../config/env.js';
import { HttpError } from '../../../shared/http/errors.js';

/** Короткоживучий: якщо токен вкрадуть, він швидко стане непотрібним. */
const ACCESS_TOKEN_TTL = '15m';

const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export function signAccessToken(userId: string): Promise<string> {
  return new SignJWT()
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(secret);
}

/** Повертає id користувача або кидає 401. */
export async function verifyAccessToken(token: string): Promise<string> {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });

    if (payload.sub) {
      return payload.sub;
    }
  } catch {
    // нижче — єдина відповідь для будь-якої проблеми з токеном
  }

  throw new HttpError(401, 'invalid_token', 'Сесія недійсна або закінчилась');
}
