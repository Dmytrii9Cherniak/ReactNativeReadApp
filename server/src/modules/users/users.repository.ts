import { eq } from 'drizzle-orm';

import { db } from '../../db/client.js';
import { users, type User } from '../../db/schema.js';

export async function findUserById(id: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

/** `email` — уже нормалізований (нижній регістр): так його нормалізують zod-схеми. */
export async function findUserByEmail(email: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}
