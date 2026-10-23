/**
 * Вид сповіщення. Сервер надсилає вид і параметри, текст складає застосунок
 * своєю мовою (див. t.notifications).
 */
export type NotificationKind =
  | 'book_approved'
  | 'book_rejected'
  | 'story_approved'
  | 'story_rejected'
  | 'xp_adjusted'
  | 'role_changed'
  | 'announcement';

export interface NotificationParams {
  /** Назва книги / історії або заголовок оголошення */
  title?: string;
  /** Причина відхилення / коментар адміна / текст оголошення */
  text?: string;
  amount?: number;
  role?: 'admin' | 'user';
}

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  params: NotificationParams;
  createdAt: string;
  read: boolean;
}
