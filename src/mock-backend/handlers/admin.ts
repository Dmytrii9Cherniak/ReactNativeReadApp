import type { AdminApi } from '@/features/admin';
import { ApiError } from '@/shared/lib/api-error';

import { toUser } from '../mappers';
import { respond } from '../respond';
import { requireRole } from '../session';

const ROLE_ORDER = { admin: 0, moderator: 1, user: 2 } as const;

export const adminHandlers: AdminApi = {
  listUsers: () =>
    respond((db) => {
      requireRole(db, ['admin']);

      return [...db.users]
        .sort(
          (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.nickname.localeCompare(b.nickname),
        )
        .map(toUser);
    }),

  setRole: (userId, role) =>
    respond((db) => {
      const admin = requireRole(db, ['admin']);

      if (admin.id === userId) {
        throw new ApiError('cannot_change_own_role');
      }

      const user = db.users.find((item) => item.id === userId);

      if (!user) {
        throw new ApiError('not_found');
      }

      user.role = role;

      return toUser(user);
    }),
};
