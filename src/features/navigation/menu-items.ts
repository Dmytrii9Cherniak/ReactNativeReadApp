import type { Permission } from '@/features/auth';
import type { Messages } from '@/shared/i18n';
import type { IconName } from '@/shared/ui';

export interface MenuItem {
  /** Ім'я маршруту в навігаторі (app/(main)/<route>.tsx) */
  route: string;
  icon: IconName;
  label: (t: Messages) => string;
  /** Без дозволу пункт не показується (і маршрут закритий у layout) */
  permission?: Permission;
}

/**
 * Пункти меню — один список і для виїзного меню (телефон), і для бокової панелі (планшет).
 * Групи розділені лінією, як у макеті (екран 2).
 */
export const MENU_GROUPS: readonly (readonly MenuItem[])[] = [
  [
    { route: 'index', icon: 'grid', label: (t) => t.menu.library },
    { route: 'my-books', icon: 'bookmark', label: (t) => t.menu.myBooks, permission: 'shelves' },
    { route: 'downloads', icon: 'download', label: (t) => t.menu.downloads },
    { route: 'campfire', icon: 'sunrise', label: (t) => t.menu.campfire },
    { route: 'profile', icon: 'award', label: (t) => t.menu.profile, permission: 'profile' },
    { route: 'upload', icon: 'upload', label: (t) => t.menu.upload, permission: 'books.upload' },
    {
      route: 'submissions',
      icon: 'inbox',
      label: (t) => t.menu.submissions,
      permission: 'books.upload',
    },
    {
      route: 'notifications',
      icon: 'bell',
      label: (t) => t.menu.notifications,
      permission: 'notifications',
    },
    { route: 'admin', icon: 'shield', label: (t) => t.menu.admin, permission: 'admin' },
  ],
  [
    { route: 'account', icon: 'user', label: (t) => t.menu.account, permission: 'profile' },
    { route: 'settings', icon: 'settings', label: (t) => t.menu.settings },
    { route: 'about', icon: 'info', label: (t) => t.menu.about },
  ],
];
