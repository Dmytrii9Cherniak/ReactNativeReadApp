import type { AuthApi } from '@/features/auth';
import { ApiError } from '@/shared/lib/api-error';

import { createId } from '../db';
import { DEMO_VERIFICATION_CODE } from '../fixtures/users';
import { toUser } from '../mappers';
import { respond } from '../respond';
import { emptyDaily } from '../rules';
import { createToken, requireUser } from '../session';

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/** Як у застосунку (features/auth/lib/validation.ts) — сервер перевіряє сам. */
const MIN_PASSWORD_LENGTH = 8;

export const authHandlers: AuthApi = {
  login: ({ email, password }) =>
    respond((db) => {
      const user = db.users.find((item) => item.email === normalizeEmail(email));

      if (!user || user.password !== password) {
        throw new ApiError('invalid_credentials');
      }

      if (user.blocked) {
        throw new ApiError('account_blocked');
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
        blocked: false,
        blockReason: null,
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

  requestPasswordReset: (email) =>
    respond((db) => {
      const normalized = normalizeEmail(email);

      // Для невідомої пошти відповідь та сама — щоб не можна було перевіряти, хто зареєстрований
      if (db.users.some((user) => user.email === normalized)) {
        db.passwordResets = [
          ...db.passwordResets.filter((item) => item.email !== normalized),
          { email: normalized, requestedAt: new Date().toISOString() },
        ];
      }
    }),

  resetPassword: ({ email, code, password }) =>
    respond((db) => {
      const normalized = normalizeEmail(email);
      const request = db.passwordResets.find((item) => item.email === normalized);
      const user = db.users.find((item) => item.email === normalized);

      if (!request || !user || code !== DEMO_VERIFICATION_CODE) {
        throw new ApiError('invalid_code');
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new ApiError('validation');
      }

      if (user.blocked) {
        throw new ApiError('account_blocked');
      }

      user.password = password;
      db.passwordResets = db.passwordResets.filter((item) => item !== request);

      return { token: createToken(user.id), user: toUser(user) };
    }),

  me: () => respond((db) => toUser(requireUser(db))),

  updateProfile: ({ nickname }) =>
    respond((db) => {
      const user = requireUser(db);
      const value = nickname.trim();

      if (value.length < 2 || value.length > 32) {
        throw new ApiError('validation');
      }

      user.nickname = value;

      return toUser(user);
    }),

  changeEmail: ({ email, password }) =>
    respond((db) => {
      const user = requireUser(db);
      const normalized = normalizeEmail(email);

      if (user.password !== password) {
        throw new ApiError('wrong_password');
      }

      if (db.users.some((item) => item.email === normalized && item.id !== user.id)) {
        throw new ApiError('email_taken');
      }

      // Справжній бекенд спершу надсилає код на нову пошту й міняє лише після підтвердження
      user.email = normalized;

      return toUser(user);
    }),

  changePassword: ({ currentPassword, newPassword }) =>
    respond((db) => {
      const user = requireUser(db);

      if (user.password !== currentPassword) {
        throw new ApiError('wrong_password');
      }

      if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new ApiError('validation');
      }

      // Справжній бекенд тут ще й відкликає інші сесії користувача
      user.password = newPassword;
    }),

  deleteAccount: ({ password }) =>
    respond((db) => {
      const user = requireUser(db);

      if (user.password !== password) {
        throw new ApiError('wrong_password');
      }

      // Видаляємо все особисте; опубліковані книги лишаються в бібліотеці без автора-завантажувача
      db.users = db.users.filter((item) => item !== user);
      db.shelves = db.shelves.filter((item) => item.userId !== user.id);
      db.notifications = db.notifications.filter((item) => item.userId !== user.id);
      db.stories = db.stories.filter((item) => item.authorId !== user.id);
      db.stories.forEach((story) => {
        story.fires = story.fires.filter((fire) => fire.userId !== user.id);
      });
      db.books.forEach((book) => {
        if (book.submittedBy === user.id) {
          book.submittedBy = null;
        }
      });
    }),

  // Токен «живе» на клієнті; справжній бекенд тут відкликає refresh-токен
  logout: () => respond(() => undefined),
};
