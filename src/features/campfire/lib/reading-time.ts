/** Середня швидкість читання — для «4 хв читання». */
const WORDS_PER_MINUTE = 180;

export function getReadingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
