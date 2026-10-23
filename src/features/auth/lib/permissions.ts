import type { Role, User } from '../types';

/** Що можна робити в застосунку. Гість (не увійшов) не має жодного дозволу. */
export type Permission =
  | 'shelves'
  | 'profile'
  | 'campfire.tell'
  | 'campfire.fire'
  | 'books.upload'
  | 'notifications'
  | 'admin';

const USER_PERMISSIONS: readonly Permission[] = [
  'shelves',
  'profile',
  'campfire.tell',
  'campfire.fire',
  'books.upload',
  'notifications',
];

/**
 * Матриця доступів. Сервер перевіряє те саме незалежно від клієнта —
 * тут лише щоб не показувати недоступне.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  user: USER_PERMISSIONS,
  admin: [...USER_PERMISSIONS, 'admin'],
};

export const ROLES: readonly Role[] = ['user', 'admin'];

export function can(user: User | null, permission: Permission): boolean {
  // Невідома роль (старі збережені дані) — жодних дозволів
  return user !== null && (ROLE_PERMISSIONS[user.role] ?? []).includes(permission);
}
