/** Мінімальна ширина картки: на телефоні виходить 3 колонки, на планшеті — 5–7. */
const MIN_CARD_WIDTH = 100;
const MIN_COLUMNS = 3;
const MAX_COLUMNS = 8;

/** Скільки колонок обкладинок вміщується в ширину з урахуванням проміжків. */
export function getColumnCount(width: number, gap: number): number {
  const columns = Math.floor((width + gap) / (MIN_CARD_WIDTH + gap));

  return Math.min(Math.max(columns, MIN_COLUMNS), MAX_COLUMNS);
}
