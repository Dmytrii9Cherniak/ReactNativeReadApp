import { useRef, useState } from 'react';

import type { Book } from '@/features/library';
import { useStatsStore } from '@/features/stats';

/**
 * Зараховує прочитане в статистику. Рахується лише просування ДАЛІ, ніж уже було в цій книзі,
 * тож повторне читання і скрол назад-вперед ранг не накручують.
 *
 * Повертає функцію: приймає поточну позицію (умовні сторінки від початку книги)
 * і повертає найдальшу досягнуту — її рідер зберігає в прогресі книги.
 */
export function useReadPagesTracker(book: Book): (position: number) => number {
  const addPages = useStatsStore((s) => s.addPages);
  const [initialFurthest] = useState(() => getInitialFurthest(book));
  const furthestRef = useRef(initialFurthest);

  return (position) => {
    const furthest = furthestRef.current;

    if (furthest !== null && position > furthest) {
      void addPages(position - furthest);
    }

    const next = furthest === null ? position : Math.max(furthest, position);

    furthestRef.current = next;

    return next;
  };
}

/**
 * Точка відліку:
 * - нова книга — з початку (0);
 * - прогрес збережений ще до появи статистики — скільки прочитано, невідомо,
 *   тому відлік почнеться з першої позиції після відкриття (null).
 */
function getInitialFurthest(book: Book): number | null {
  if (!book.progress) {
    return 0;
  }

  return book.progress.furthestPages ?? null;
}
