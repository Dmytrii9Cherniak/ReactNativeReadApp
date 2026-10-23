import { useDownloadsStore } from '@/features/downloads';
import { useProgress } from '@/features/progression';
import { summarize, useBookmarksCount, useReadingStatsStore } from '@/features/reader';

import { ACHIEVEMENTS, type Achievement } from '../lib/achievements';

/** Усі досягнення з позначкою «отримано». */
export function useAchievements(): { achievement: Achievement; isUnlocked: boolean }[] {
  const progress = useProgress();
  const days = useReadingStatsStore((s) => s.days);
  const finishedBookIds = useReadingStatsStore((s) => s.finishedBookIds);
  const hasReadAtNight = useReadingStatsStore((s) => s.hasReadAtNight);
  const bookmarks = useBookmarksCount();
  const downloads = useDownloadsStore((s) => Object.keys(s.items).length);
  const context = {
    progress,
    reading: summarize({ days, finishedBookIds, hasReadAtNight }),
    bookmarks,
    downloads,
  };

  return ACHIEVEMENTS.map((achievement) => ({
    achievement,
    isUnlocked: achievement.isUnlocked(context),
  }));
}
