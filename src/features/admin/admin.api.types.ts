import type { Role, User } from '@/features/auth';

/**
 * Контракт керування користувачами = майбутні ендпоінти (лише admin):
 *   GET   /admin/users                  → User[]
 *   PATCH /admin/users/:id   { role }   → User   (власну роль змінити не можна)
 */
export interface AdminApi {
  listUsers(): Promise<User[]>;
  setRole(userId: string, role: Role): Promise<User>;
}
