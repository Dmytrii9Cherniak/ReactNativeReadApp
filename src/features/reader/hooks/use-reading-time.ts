import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useReadingStatsStore } from '../reading-stats.store';

const TICK_SECONDS = 15;

/** Рахує час читання, поки рідер відкритий і застосунок на екрані. */
export function useReadingTime(isReading: boolean) {
  const addReadingTime = useReadingStatsStore((s) => s.addReadingTime);

  useEffect(() => {
    if (!isReading) {
      return undefined;
    }

    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        addReadingTime(TICK_SECONDS);
      }
    }, TICK_SECONDS * 1000);

    return () => clearInterval(timer);
  }, [isReading, addReadingTime]);
}
