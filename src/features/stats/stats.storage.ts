import { File, Paths } from 'expo-file-system';

import type { StatsStorage } from './stats.storage.types';
import type { DailyPages } from './types';

/** iOS / Android: Paths.document/stats.json */
const statsFile = () => new File(Paths.document, 'stats.json');

export const statsStorage: StatsStorage = {
  async read() {
    const file = statsFile();

    if (!file.exists) {
      return {};
    }

    try {
      return JSON.parse(await file.text()) as DailyPages;
    } catch {
      return {};
    }
  },

  async write(daily) {
    statsFile().write(JSON.stringify(daily));
  },
};
