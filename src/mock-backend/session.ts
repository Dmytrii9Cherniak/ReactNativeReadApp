import type { Role } from '@/features/auth';
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

  return db.users.find((user) => user.id === userId) ?? null;
}

export function requireUser(db: Db): UserRecord {
  const user = findCurrentUser(db);

  if (!user) {
    throw new ApiError('unauthorized');
  }

  return user;
}

export function requireRole(db: Db, roles: readonly Role[]): UserRecord {
  const user = requireUser(db);

  if (!roles.includes(user.role)) {
    throw new ApiError('forbidden');
  }

  return user;
}

export const STAFF_ROLES: readonly Role[] = ['moderator', 'admin'];
