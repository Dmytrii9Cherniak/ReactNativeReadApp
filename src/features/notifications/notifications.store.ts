import { create } from 'zustand';

import { notificationsApi } from './notifications.api';

import type { AppNotification } from './types';

interface NotificationsState {
  items: AppNotification[] | null;
  unread: number;
  load: () => Promise<void>;
  markAllRead: () => Promise<void>;
  /** Живі оновлення після входу; повертає «зупинити» */
  start: () => () => void;
  reset: () => void;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: null,
  unread: 0,

  async load() {
    const items = await notificationsApi.list();

    set({ items, unread: items.filter((item) => !item.read).length });
  },

  async markAllRead() {
    await notificationsApi.markAllRead();
    // Підсвітку «нове» лишаємо до наступного відкриття — так видно, що саме прийшло
    set({ unread: 0 });
  },

  start() {
    const refresh = () => {
      // Лічильник у меню — не критичний: оновиться з наступною подією
      get()
        .load()
        .catch(() => undefined);
    };

    refresh();

    return notificationsApi.subscribe(refresh);
  },

  reset() {
    set({ items: null, unread: 0 });
  },
}));

export const useUnreadCount = () => useNotificationsStore((s) => s.unread);
