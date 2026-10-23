import { createJSONStorage } from 'zustand/middleware';

import { kvStorage } from './kv-storage';

/** Сховище для zustand persist: стан фічі зберігається між запусками застосунку. */
export const persistStorage = createJSONStorage(() => kvStorage);
