import { and, eq, isNull } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { refreshTokens, type User } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { toPublicUser, type PublicUser } from '../users/public-user.js';
import { findUserById } from '../users/users.repository.js';
import { signAccessToken } from './lib/access-token.js';
import { REFRESH_TOKEN_TTL_MS, createRefreshToken, hashRefreshToken } from './lib/refresh-token.js';

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

const invalidSession = () =>
  new HttpError(401, 'invalid_session', 'Сесія недійсна або закінчилась — увійди знову');

export async function createSession(user: User): Promise<Session> {
  const { token, tokenHash } = createRefreshToken();

  await db.insert(refreshTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });

  return {
    accessToken: await signAccessToken(user.id),
    refreshToken: token,
    user: toPublicUser(user),
  };
}

/**
 * Ротація: старий refresh-токен відкликається, видається нова пара.
 * Повторне використання вже відкликаного токена означає, що його могли вкрасти, —
 * тоді завершуються всі сесії користувача.
 */
export async function rotateSession(refreshToken: string): Promise<Session> {
  const stored = await db.query.refreshTokens.findFirst({
    where: eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)),
  });

  if (!stored) {
    throw invalidSession();
  }

  if (stored.revokedAt) {
    await revokeAllSessions(stored.userId);

    throw invalidSession();
  }

  if (stored.expiresAt.getTime() <= Date.now()) {
    throw invalidSession();
  }

  // Умова revokedAt IS NULL — щоб два одночасні запити не отримали дві нові сесії з одного токена
  const [revoked] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.id, stored.id), isNull(refreshTokens.revokedAt)))
    .returning({ id: refreshTokens.id });

  const user = revoked ? await findUserById(stored.userId) : undefined;

  if (!user) {
    throw invalidSession();
  }

  return createSession(user);
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.tokenHash, hashRefreshToken(refreshToken)),
        isNull(refreshTokens.revokedAt),
      ),
    );
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}
