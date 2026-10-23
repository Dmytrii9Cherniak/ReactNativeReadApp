/**
 * Просте сховище «ключ → рядок» між запусками застосунку.
 * Реалізації: kv-storage.ts (iOS/Android — файли), kv-storage.web.ts (web — IndexedDB).
 * Сумісне з zustand persist (createJSONStorage).
 */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
