import * as SecureStore from 'expo-secure-store';

import type { AuthStorage, StoredSession } from './auth.storage.types';

/** iOS / Android: Keychain / Keystore — зашифроване сховище системи. */
const SESSION_KEY = 'auth.session';

export const authStorage: AuthStorage = {
  async read() {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);

    return raw ? (JSON.parse(raw) as StoredSession) : null;
  },

  async write(session) {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  },

  async clear() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },
};
