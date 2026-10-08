import type { AuthStorage, StoredSession } from './auth.storage.types';

/**
 * Web: захищеного сховища в браузері немає — localStorage.
 * Ризик — XSS (чужий скрипт на сторінці прочитає токен). Пом'якшення: refresh-токен
 * одноразовий (ротація), а повторне використання вкраденого завершує всі сесії.
 */
const SESSION_KEY = 'auth.session';

export const authStorage: AuthStorage = {
  async read() {
    const raw = localStorage.getItem(SESSION_KEY);

    return raw ? (JSON.parse(raw) as StoredSession) : null;
  },

  async write(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  async clear() {
    localStorage.removeItem(SESSION_KEY);
  },
};
