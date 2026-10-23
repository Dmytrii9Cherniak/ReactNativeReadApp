import { createJSONStorage } from 'zustand/middleware';

import { kvStorage } from './kv-storage';

import type { KeyValueStorage } from './kv-storage.types';

/**
 * Сховище для zustand persist — стійке до збоїв: якщо диск / IndexedDB недоступні
 * (приватний режим браузера, брак місця, пошкоджений файл), застосунок працює далі
 * зі значеннями за замовчуванням, а не падає.
 */
const safeStorage: KeyValueStorage = {
  async getItem(key) {
    try {
      return await kvStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    try {
      await kvStorage.setItem(key, value);
    } catch {
      // Не збереглося між запусками — у пам'яті стан лишається актуальним
    }
  },

  async removeItem(key) {
    try {
      await kvStorage.removeItem(key);
    } catch {
      // Див. setItem
    }
  },
};

/** Сховище для zustand persist: стан фічі зберігається між запусками застосунку. */
export const persistStorage = createJSONStorage(() => safeStorage);
