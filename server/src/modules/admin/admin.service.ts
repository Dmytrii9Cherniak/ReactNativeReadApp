import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '../../db/client.js';
import { users, type User } from '../../db/schema.js';
import { HttpError } from '../../shared/http/errors.js';
import { toPublicUser } from '../users/public-user.js';

import type { permissionsSchema } from './admin.schemas.js';

/** Користувач для адмінки: публічні поля + службові. */
export function toAdminUser(user: User) {
  return {
    ...toPublicUser(user),
    emailVerified: user.emailVerifiedAt !== null,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listUsers() {
  const rows = await db.select().from(users).orderBy(desc(users.createdAt));

  return rows.map(toAdminUser);
}

export async function updatePermissions(
  actor: User,
  userId: string,
  changes: z.infer<typeof permissionsSchema>,
) {
  // Інакше можна випадково лишити систему без жодного адміна
  if (userId === actor.id && changes.isAdmin === false) {
    throw new HttpError(400, 'cannot_demote_self', 'Не можна зняти права адміна із себе');
  }

  const [updated] = await db.update(users).set(changes).where(eq(users.id, userId)).returning();

  if (!updated) {
    throw new HttpError(404, 'user_not_found', 'Користувача не знайдено');
  }

  return toAdminUser(updated);
}
