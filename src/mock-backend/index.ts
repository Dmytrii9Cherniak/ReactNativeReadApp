/**
 * Тестовий сервер у пам'яті застосунку — до появи справжнього бекенду.
 *
 * Кожен обробник реалізує контракт API фічі (`<feature>.api.types.ts`) і поводиться як
 * майбутній ендпоінт: перевіряє токен і роль, ліміти, повертає ті самі DTO й коди помилок.
 * Коли бекенд буде готовий, у `<feature>.api.ts` mockServer замінюється на HTTP-клієнт,
 * а ця папка видаляється. Екрани й стори при цьому не змінюються.
 */
import { adminHandlers } from './handlers/admin';
import { authHandlers } from './handlers/auth';
import { campfireHandlers } from './handlers/campfire';
import { catalogHandlers } from './handlers/catalog';
import { notificationsHandlers } from './handlers/notifications';
import { progressionHandlers } from './handlers/progression';
import { shelvesHandlers } from './handlers/shelves';
import { uploadHandlers } from './handlers/upload';

export const mockServer = {
  admin: adminHandlers,
  auth: authHandlers,
  campfire: campfireHandlers,
  catalog: catalogHandlers,
  notifications: notificationsHandlers,
  progression: progressionHandlers,
  shelves: shelvesHandlers,
  upload: uploadHandlers,
};

export { DEMO_ACCOUNTS, DEMO_VERIFICATION_CODE } from './fixtures/users';
