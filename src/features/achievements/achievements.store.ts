import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

import type { AchievementId } from './lib/achievements';

interface AchievementsState {
  /** Про які вже повідомили — щоб «Нове досягнення» не показувалось двічі */
  announced: AchievementId[];
  announce: (ids: AchievementId[]) => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      announced: [],
      announce: (ids) => set({ announced: [...new Set([...get().announced, ...ids])] }),
    }),
    { name: 'achievements', storage: persistStorage },
  ),
);
