import type { User } from './types';

/**
 * Збережена між запусками сесія: refresh-токен (секрет) і останній відомий користувач —
 * щоб застосунок одразу показував акаунт навіть без інтернету.
 * Access-токен не зберігається: він живе 15 хв і видається заново при старті.
 */
export interface StoredSession {
  refreshToken: string;
  user: User;
}

/** Реалізації: auth.storage.ts (iOS/Android, SecureStore), auth.storage.web.ts (web). */
export interface AuthStorage {
  read(): Promise<StoredSession | null>;
  write(session: StoredSession): Promise<void>;
  clear(): Promise<void>;
}
