import { del, get, set } from 'idb-keyval';

import type { KeyValueStorage } from './kv-storage.types';

/** Web: IndexedDB браузера. */
export const kvStorage: KeyValueStorage = {
  async getItem(key) {
    return (await get<string>(key)) ?? null;
  },

  async setItem(key, value) {
    await set(key, value);
  },

  async removeItem(key) {
    await del(key);
  },
};
