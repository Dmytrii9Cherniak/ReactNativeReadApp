import type { Messages } from '@/shared/i18n';
import type { IconName } from '@/shared/ui';

import type { AppNotification, NotificationKind } from '../types';

export const NOTIFICATION_ICONS: Record<NotificationKind, IconName> = {
  book_approved: 'check-circle',
  book_rejected: 'x-circle',
  story_approved: 'check-circle',
  story_rejected: 'x-circle',
  xp_adjusted: 'zap',
  role_changed: 'shield',
  announcement: 'bell',
};

/** Заголовок і текст сповіщення мовою інтерфейсу (сервер надсилає лише вид і параметри). */
export function formatNotification(
  t: Messages,
  { kind, params }: AppNotification,
): { title: string; text: string | null } {
  const title = params.title ?? '';
  const text = params.text ?? null;

  switch (kind) {
    case 'book_approved':
      return { title: t.notifications.kinds.book_approved(title), text: null };
    case 'book_rejected':
      return {
        title: t.notifications.kinds.book_rejected(title),
        text: text && t.admin.rejectedBecause(text),
      };
    case 'story_approved':
      return { title: t.notifications.kinds.story_approved(title), text: null };
    case 'story_rejected':
      return {
        title: t.notifications.kinds.story_rejected(title),
        text: text && t.admin.rejectedBecause(text),
      };
    case 'xp_adjusted':
      return { title: t.notifications.kinds.xp_adjusted(params.amount ?? 0), text };
    case 'role_changed':
      return {
        title: t.notifications.kinds.role_changed(t.roles[params.role ?? 'user']),
        text: null,
      };
    case 'announcement':
      return { title, text };
  }
}
