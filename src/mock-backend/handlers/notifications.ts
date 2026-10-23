import type { NotificationsApi } from '@/features/notifications';

import { subscribe } from '../events';
import { respond } from '../respond';
import { requireUser } from '../session';

export const notificationsHandlers: NotificationsApi = {
  list: () =>
    respond((db) => {
      const user = requireUser(db);

      return db.notifications
        .filter((item) => item.userId === user.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(({ userId: _userId, ...item }) => item);
    }),

  markAllRead: () =>
    respond((db) => {
      const user = requireUser(db);

      db.notifications.forEach((item) => {
        if (item.userId === user.id) {
          item.read = true;
        }
      });
    }),

  subscribe: (listener) => subscribe('notifications', listener),
};
