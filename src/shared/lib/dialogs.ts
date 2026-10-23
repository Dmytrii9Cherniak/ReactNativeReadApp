import { useDialogsStore, type NoticeType } from './dialogs.store';

import type { ConfirmOptions } from './dialogs.types';

/** Скільки сповіщення видно: помилку — довше, щоб встигнути прочитати. */
const NOTICE_DURATION_MS: Record<NoticeType, number> = {
  success: 3000,
  info: 4000,
  error: 5000,
};

function show(type: NoticeType, title: string, message?: string): void {
  const { push, dismiss } = useDialogsStore.getState();
  const id = push({ type, title, message });

  setTimeout(() => dismiss(id), NOTICE_DURATION_MS[type]);
}

/**
 * Сповіщення застосунку — однакові на iOS, Android і web
 * (без системних Alert / window.alert). Показує їх `NotificationHost`.
 */
export const notify = {
  success: (title: string, message?: string) => show('success', title, message),
  error: (title: string, message?: string) => show('error', title, message),
  info: (title: string, message?: string) => show('info', title, message),
};

/** Діалог «Так / Скасувати» у стилі застосунку. Закриття поза діалогом — «Скасувати». */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return useDialogsStore.getState().ask(options);
}
