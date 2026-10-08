import type { Permission, User } from '../types';

/** Без `permission` — достатньо бути залогіненим. Адмін має всі права (як на сервері). */
export function isAllowed(user: User | null, permission?: Permission): boolean {
  if (!user) {
    return false;
  }

  if (!permission) {
    return true;
  }

  return user.isAdmin || user[permission];
}
