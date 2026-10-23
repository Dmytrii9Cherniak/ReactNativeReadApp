import type { Progress } from '@/features/progression';
import type { ReadingSummary } from '@/features/reader';
import type { IconName } from '@/shared/ui';

/** Усе, з чого рахуються досягнення. */
export interface AchievementContext {
  /** null — гість або ще не завантажено */
  progress: Progress | null;
  reading: ReadingSummary;
  bookmarks: number;
  downloads: number;
}

export type AchievementId =
  | 'first_book'
  | 'bookworm'
  | 'first_story'
  | 'storyteller'
  | 'fire_keeper'
  | 'true_stalker'
  | 'streak_week'
  | 'marathon'
  | 'night_reader'
  | 'quote_collector'
  | 'prepper';

export interface Achievement {
  id: AchievementId;
  icon: IconName;
  isUnlocked: (context: AchievementContext) => boolean;
}

/** Поріг рангу «Сталкер» (дизайн-документ, розділ 3). */
const STALKER_XP = 150;

/**
 * Досягнення рахуються з уже наявних даних — окремої таблиці не потрібно.
 * З бекендом частину (історії, вогники) перевірятиме сервер.
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first_book', icon: 'book-open', isUnlocked: (c) => c.reading.finishedBooks >= 1 },
  { id: 'bookworm', icon: 'book', isUnlocked: (c) => c.reading.finishedBooks >= 5 },
  { id: 'first_story', icon: 'sunrise', isUnlocked: (c) => (c.progress?.storiesCount ?? 0) >= 1 },
  { id: 'storyteller', icon: 'feather', isUnlocked: (c) => (c.progress?.storiesCount ?? 0) >= 10 },
  { id: 'fire_keeper', icon: 'zap', isUnlocked: (c) => (c.progress?.firesReceived ?? 0) >= 100 },
  { id: 'true_stalker', icon: 'award', isUnlocked: (c) => (c.progress?.xp ?? 0) >= STALKER_XP },
  { id: 'streak_week', icon: 'calendar', isUnlocked: (c) => c.reading.streak >= 7 },
  { id: 'marathon', icon: 'clock', isUnlocked: (c) => c.reading.bestDayMinutes >= 60 },
  { id: 'night_reader', icon: 'moon', isUnlocked: (c) => c.reading.hasReadAtNight },
  { id: 'quote_collector', icon: 'bookmark', isUnlocked: (c) => c.bookmarks >= 5 },
  { id: 'prepper', icon: 'download', isUnlocked: (c) => c.downloads >= 1 },
];
