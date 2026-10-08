import type { Rank } from '../types';

/** 7 рангів за загальною кількістю прочитаних умовних сторінок. Книга ≈ 300 сторінок. */
export const RANKS: readonly Rank[] = [
  { title: 'Відмичка', description: 'Щойно потрапив у Зону', minPages: 0 },
  { title: 'Новачок', description: 'Перші кроки за Кордоном', minPages: 50 },
  { title: 'Сталкер', description: 'Перша книга за плечима', minPages: 300 },
  { title: 'Досвідчений', description: 'Знає кожну аномалію на Кордоні', minPages: 1000 },
  { title: 'Ветеран', description: 'Близько десяти книг пройдено', minPages: 3000 },
  { title: 'Майстер', description: 'Ходить туди, куди інші не наважуються', minPages: 7500 },
  { title: 'Легенда Зони', description: 'Про нього розповідають біля вогнища', minPages: 15000 },
];

export interface RankStatus {
  rank: Rank;
  /** Номер рангу з 1 */
  level: number;
  /** null — найвищий ранг */
  next: Rank | null;
  /** Прогрес до наступного рангу 0..1 */
  progress: number;
  pagesToNext: number;
}

export function getRankStatus(totalPages: number): RankStatus {
  const index = RANKS.findLastIndex((r) => totalPages >= r.minPages);
  const rank = RANKS[index];
  const level = index + 1;

  if (level === RANKS.length) {
    return { rank, level, next: null, progress: 1, pagesToNext: 0 };
  }

  const next = RANKS[index + 1];

  return {
    rank,
    level,
    next,
    progress: (totalPages - rank.minPages) / (next.minPages - rank.minPages),
    pagesToNext: next.minPages - totalPages,
  };
}
