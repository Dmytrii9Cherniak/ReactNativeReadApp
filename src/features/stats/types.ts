/** Дата 'YYYY-MM-DD' за локальним часом пристрою. */
export type DayKey = string;

/**
 * Прочитані умовні сторінки за днями (дробові — TXT рахується за знаками).
 * Загальна сума не зберігається окремо, а рахується з цих даних — тож не може розійтися з ними.
 */
export type DailyPages = Record<DayKey, number>;

export interface Rank {
  title: string;
  description: string;
  /** Скільки всього умовних сторінок треба прочитати для рангу */
  minPages: number;
}
