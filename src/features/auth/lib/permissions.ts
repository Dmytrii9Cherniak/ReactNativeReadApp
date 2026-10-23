import type { Role, User } from '../types';

/** Що можна робити в застосунку. Гість (не увійшов) не має жодного дозволу. */
export type Permission =
  | 'shelves'
  | 'profile'
  | 'campfire.tell'
  | 'campfire.fire'
  | 'books.upload'
  | 'moderation'
  | 'users.manage';

const USER_PERMISSIONS: readonly Permission[] = [
  'shelves',
  'profile',
  'campfire.tell',
  'campfire.fire',
  'books.upload',
];

/**
 * Матриця доступів. Сервер перевіряє те саме незалежно від клієнта —
 * тут лише щоб не показувати недоступне.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: USER_PERMISSIONS,
  moderator: [...USER_PERMISSIONS, 'moderation'],
  admin: [...USER_PERMISSIONS, 'moderation', 'users.manage'],
};

export const ROLES: readonly Role[] = ['user', 'moderator', 'admin'];

export function can(user: User | null, permission: Permission): boolean {
  return user !== null && ROLE_PERMISSIONS[user.role].includes(permission);
}
