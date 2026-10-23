import { create } from 'zustand';

import { progressionApi } from './progression.api';

import type { FactionId, Progress } from './types';

interface ProgressionState {
  /** null — гість або ще не завантажено */
  progress: Progress | null;
  load: () => Promise<void>;
  /** Повертає нараховане XP */
  watchAd: () => Promise<number>;
  joinFaction: (factionId: FactionId) => Promise<void>;
  reset: () => void;
}

/** Досвід, ранг і угруповання поточного користувача. Усе рахує сервер. */
export const useProgressionStore = create<ProgressionState>()((set) => ({
  progress: null,

  async load() {
    set({ progress: await progressionApi.getProgress() });
  },

  async watchAd() {
    const { xp, progress } = await progressionApi.watchAd();

    set({ progress });

    return xp;
  },

  async joinFaction(factionId) {
    set({ progress: await progressionApi.joinFaction(factionId) });
  },

  reset() {
    set({ progress: null });
  },
}));

export const useProgress = () => useProgressionStore((s) => s.progress);
