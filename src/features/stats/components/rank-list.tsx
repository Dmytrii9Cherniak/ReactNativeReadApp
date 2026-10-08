import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, spacing, type ColorToken } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { RANKS, getRankStatus } from '../lib/ranks';

import type { Rank } from '../types';

type RankState = 'achieved' | 'current' | 'locked';

const titleColor: Record<RankState, ColorToken> = {
  achieved: 'foreground',
  current: 'primary',
  locked: 'muted',
};

/** Усі ранги: пройдені, поточний (підсвічений) і ще закриті. */
export function RankList({ totalPages }: { totalPages: number }) {
  const { level: currentLevel } = getRankStatus(totalPages);

  return (
    <View>
      {RANKS.map((rank, index) => (
        <RankRow
          key={rank.title}
          rank={rank}
          level={index + 1}
          state={getRankState(index + 1, currentLevel)}
        />
      ))}
    </View>
  );
}

function RankRow({ rank, level, state }: { rank: Rank; level: number; state: RankState }) {
  return (
    <View style={[styles.row, state === 'current' && styles.current]}>
      <Text variant="mono">{String(level).padStart(2, '0')}</Text>
      <Text variant="label" color={titleColor[state]} style={styles.title}>
        {rank.title}
      </Text>
      <Text variant="mono">{`${rank.minPages} стор.`}</Text>
    </View>
  );
}

function getRankState(level: number, currentLevel: number): RankState {
  if (level < currentLevel) {
    return 'achieved';
  }

  if (level === currentLevel) {
    return 'current';
  }

  return 'locked';
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  current: { backgroundColor: colors.surfaceRaised },
  title: { flex: 1 },
});
