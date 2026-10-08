/**
 * Призначає адміна за поштою: `npm run make-admin -- you@example.com`.
 * Потрібен для першого адміна — далі права видаються через API адмінки.
 */
import { eq } from 'drizzle-orm';

import { db, pool } from '../db/client.js';
import { users } from '../db/schema.js';

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error('Вкажи пошту: npm run make-admin -- you@example.com');
  process.exit(1);
}

const [user] = await db
  .update(users)
  .set({ isAdmin: true })
  .where(eq(users.email, email))
  .returning({ email: users.email });

console.log(user ? `${user.email} тепер адмін` : `Користувача ${email} не знайдено`);

await pool.end();
process.exitCode = user ? 0 : 1;
