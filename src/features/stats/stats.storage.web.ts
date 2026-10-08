import { get, set } from 'idb-keyval';

import type { StatsStorage } from './stats.storage.types';
import type { DailyPages } from './types';

/** Web: IndexedDB, той самий підхід, що й у бібліотеці. */
const DAILY_KEY = 'stats:daily';

export const statsStorage: StatsStorage = {
  async read() {
    return (await get<DailyPages>(DAILY_KEY)) ?? {};
  },

  async write(daily) {
    await set(DAILY_KEY, daily);
  },
};
