import type { AuthApi } from '@/features/auth';
import { ApiError } from '@/shared/lib/api-error';

import { createId } from '../db';
import { DEMO_VERIFICATION_CODE } from '../fixtures/users';
import { toUser } from '../mappers';
import { respond } from '../respond';
import { emptyDaily } from '../rules';
import { createToken, requireUser } from '../session';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const authHandlers: AuthApi = {
  login: ({ email, password }) =>
    respond((db) => {
      const user = db.users.find((item) => item.email === normalizeEmail(email));

      if (!user || user.password !== password) {
        throw new ApiError('invalid_credentials');
      }

      return { token: createToken(user.id), user: toUser(user) };
    }),

  signup: ({ nickname, email, password }) =>
    respond((db) => {
      const normalized = normalizeEmail(email);

      if (db.users.some((user) => user.email === normalized)) {
        throw new ApiError('email_taken');
      }

      // Справжній бекенд тут надсилає лист із випадковим 6-значним кодом
      db.pendingSignups = [
        ...db.pendingSignups.filter((item) => item.email !== normalized),
        { nickname: nickname.trim(), email: normalized, password },
      ];
    }),

  verify: ({ email, code }) =>
    respond((db) => {
      const normalized = normalizeEmail(email);
      const pending = db.pendingSignups.find((item) => item.email === normalized);

      if (!pending || code !== DEMO_VERIFICATION_CODE) {
        throw new ApiError('invalid_code');
      }

      const user = {
        ...pending,
        id: createId('u'),
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        xp: 0,
        factionId: 'loners' as const,
        factionChangedAt: null,
        storiesCount: 0,
        firesReceived: 0,
        nonStopStreak: 0,
        nonStopEarned: 0,
        lastStoryDay: null,
        daily: emptyDaily(),
      };

      db.users.push(user);
      db.pendingSignups = db.pendingSignups.filter((item) => item !== pending);

      return { token: createToken(user.id), user: toUser(user) };
    }),

  resendCode: (email) =>
    respond((db) => {
      if (!db.pendingSignups.some((item) => item.email === normalizeEmail(email))) {
        throw new ApiError('not_found');
      }
    }),

  me: () => respond((db) => toUser(requireUser(db))),

  // Токен «живе» на клієнті; справжній бекенд тут відкликає refresh-токен
  logout: () => respond(() => undefined),
};
