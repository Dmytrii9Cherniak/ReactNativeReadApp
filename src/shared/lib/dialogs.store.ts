import { create } from 'zustand';

import type { ConfirmOptions } from './dialogs.types';

export type NoticeType = 'success' | 'error' | 'info';

export interface Notice {
  id: number;
  type: NoticeType;
  title: string;
  message?: string;
}

export interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

interface DialogsState {
  notices: Notice[];
  confirmRequest: ConfirmRequest | null;
  push: (notice: Omit<Notice, 'id'>) => number;
  dismiss: (id: number) => void;
  ask: (options: ConfirmOptions) => Promise<boolean>;
  answer: (confirmed: boolean) => void;
}

/** Більше трьох сповіщень одночасно — лише шум: найстаріші зникають. */
const MAX_NOTICES = 3;

let nextId = 1;

/**
 * Стан сповіщень і діалогу підтвердження. Показує їх `NotificationHost` (shared/ui),
 * викликати — через `notify` / `confirm` з `shared/lib/dialogs`.
 */
export const useDialogsStore = create<DialogsState>()((set, get) => ({
  notices: [],
  confirmRequest: null,

  push(notice) {
    const id = nextId++;

    set({ notices: [...get().notices, { ...notice, id }].slice(-MAX_NOTICES) });

    return id;
  },

  dismiss(id) {
    set({ notices: get().notices.filter((notice) => notice.id !== id) });
  },

  ask(options) {
    // Новий запит закриває попередній як «Скасувати» — завис би без відповіді
    get().confirmRequest?.resolve(false);

    return new Promise((resolve) => {
      set({ confirmRequest: { ...options, resolve } });
    });
  },

  answer(confirmed) {
    get().confirmRequest?.resolve(confirmed);
    set({ confirmRequest: null });
  },
}));
