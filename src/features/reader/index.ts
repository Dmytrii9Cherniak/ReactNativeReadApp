/** Публічний API фічі reader: читання, закладки, статистика читання, «Продовжити читання». */
export { useBookmarksCount } from './bookmarks.store';
export { ContinueReading } from './components/continue-reading';
export { ReadingStatsCard } from './components/reading-stats-card';
export { ReaderScreen } from './reader-screen';
export { useReadingPosition } from './reading-progress.store';
export { summarize, useReadingStatsStore, type ReadingSummary } from './reading-stats.store';
