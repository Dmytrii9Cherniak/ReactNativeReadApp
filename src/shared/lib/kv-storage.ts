import { Directory, File, Paths } from 'expo-file-system';

import type { KeyValueStorage } from './kv-storage.types';

/** iOS / Android: кожен ключ — окремий JSON-файл у Paths.document/kv. */
const storageDir = () => new Directory(Paths.document, 'kv');
const keyFile = (key: string) => new File(storageDir(), `${encodeURIComponent(key)}.json`);

export const kvStorage: KeyValueStorage = {
  async getItem(key) {
    const file = keyFile(key);

    return file.exists ? file.text() : null;
  },

  async setItem(key, value) {
    storageDir().create({ intermediates: true, idempotent: true });
    keyFile(key).write(value);
  },

  async removeItem(key) {
    const file = keyFile(key);

    if (file.exists) {
      file.delete();
    }
  },
};
