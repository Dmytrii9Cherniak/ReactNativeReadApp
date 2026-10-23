import type { Messages } from './uk';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/** «3 дні тому», «тиждень тому» — для стрічки й карток. */
export function formatRelativeTime(t: Messages, iso: string, now = Date.now()): string {
  const time = new Date(iso).getTime();

  // Некоректна дата з сервера — краще нічого, ніж «NaN днів тому»
  if (Number.isNaN(time)) {
    return '';
  }

  const diff = Math.max(0, now - time);

  if (diff < MINUTE) {
    return t.time.justNow;
  }

  if (diff < HOUR) {
    return t.time.minutesAgo(Math.floor(diff / MINUTE));
  }

  if (diff < DAY) {
    return t.time.hoursAgo(Math.floor(diff / HOUR));
  }

  if (diff < WEEK) {
    return t.time.daysAgo(Math.floor(diff / DAY));
  }

  return t.time.weeksAgo(Math.floor(diff / WEEK));
}
