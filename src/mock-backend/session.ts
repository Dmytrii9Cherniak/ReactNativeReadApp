import { ApiError } from '@/shared/lib/api-error';
import { apiSession } from '@/shared/lib/api-session';

import type { Db, UserRecord } from './db';

const TOKEN_PREFIX = 'mock-token:';

/** Справжній бекенд видасть JWT; тут токен просто містить id користувача. */
export const createToken = (userId: string) => `${TOKEN_PREFIX}${userId}`;

/** Користувач запиту за токеном (аналог middleware авторизації); null — гість. */
export function findCurrentUser(db: Db): UserRecord | null {
  const token = apiSession.getToken();

  if (!token?.startsWith(TOKEN_PREFIX)) {
    return null;
  }

  const userId = token.slice(TOKEN_PREFIX.length);
  const user = db.users.find((item) => item.id === userId) ?? null;

  // Заблокований — наче без сесії: кожен запит відхиляється
  return user?.blocked ? null : user;
}

export function requireUser(db: Db): UserRecord {
  const token = apiSession.getToken();
  const user = findCurrentUser(db);

  if (!user) {
    const isBlocked = db.users.some((item) => item.blocked && token === createToken(item.id));

    throw new ApiError(isBlocked ? 'account_blocked' : 'unauthorized');
  }

  return user;
}

export function requireAdmin(db: Db): UserRecord {
  const user = requireUser(db);

  if (user.role !== 'admin') {
    throw new ApiError('forbidden');
  }

  return user;
}

export const isAdmin = (user: UserRecord | null) => user?.role === 'admin';
