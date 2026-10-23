import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

import { RANK_THRESHOLDS, getRankByIndex, getRankIndex } from '../lib/ranks';

import type { FactionId } from '../types';

/** Усі 10 рангів угруповання з порогами; поточний підсвічено. */
export function RankLadder({ xp, factionId }: { xp: number; factionId: FactionId }) {
  const t = useT();
  const currentIndex = getRankIndex(xp);

  return (
    <Card>
      <Text variant="sectionLabel">{t.progression.ranks}</Text>
      {RANK_THRESHOLDS.map((_, index) => {
        const rank = getRankByIndex(index, factionId);
        const isCurrent = index === currentIndex;
        const isReached = index <= currentIndex;

        return (
          <View key={rank.index} style={[styles.row, isCurrent && styles.current]}>
            <Text variant="caption" color="textFaint" style={styles.number}>
              {index + 1}
            </Text>
            <Text
              variant="caption"
              color={
                rank.isEndgame || (isReached && rank.isGold)
                  ? 'gold'
                  : isReached
                    ? 'text'
                    : 'textMuted'
              }
              style={[styles.name, isCurrent && styles.bold]}>
              {rank.isEndgame ? `${rank.name} · ENDGAME` : rank.name}
            </Text>
            <Text variant="caption" color={isReached ? 'primaryLight' : 'textFaint'}>
              {t.progression.rankXp(rank.threshold)}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: 'transparent',
  },
  current: { backgroundColor: colors.goldSurface, borderColor: colors.gold },
  number: { width: 18 },
  name: { flex: 1 },
  bold: { fontWeight: '700' },
});
