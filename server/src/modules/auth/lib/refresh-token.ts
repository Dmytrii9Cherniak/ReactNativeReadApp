import { createHash, randomBytes } from 'node:crypto';

export const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Випадковий токен для клієнта і його хеш для бази. */
export function createRefreshToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');

  return { token, tokenHash: hashRefreshToken(token) };
}

/** SHA-256 достатньо: токен — 256 випадкових біт, підбирати його марно. */
export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
