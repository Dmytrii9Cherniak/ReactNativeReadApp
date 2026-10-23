import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { colors, radius } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

import { getRank, getRankByIndex, getRankProgress, roundXp } from '../lib/ranks';

import type { FactionId } from '../types';

interface XpCardProps {
  xp: number;
  factionId: FactionId;
}

/** Шкала досвіду: «150 / 400 XP», поточний і наступний ранг, скільки лишилось. */
export function XpCard({ xp, factionId }: XpCardProps) {
  const t = useT();
  const rank = getRank(xp, factionId);
  const next = rank.nextThreshold === null ? null : getRankByIndex(rank.index + 1, factionId);
  const percent = `${Math.round(getRankProgress(xp, rank) * 100)}%` as const;

  return (
    <Card>
      <View style={styles.row}>
        <Text variant="sectionLabel">{t.progression.xp}</Text>
        <Text variant="caption" color="primaryLight" style={styles.bold}>
          {next ? t.progression.xpOf(roundXp(xp), next.threshold) : `${roundXp(xp)} XP`}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: percent }]} />
      </View>
      <View style={styles.row}>
        <Text variant="caption" color={rank.isGold ? 'gold' : 'primaryLight'} style={styles.bold}>
          {rank.name}
        </Text>
        {next ? <Text variant="caption">{next.name}</Text> : null}
      </View>
      <Text variant="caption" color="textFaint" style={styles.center}>
        {next ? t.progression.toNext(roundXp(next.threshold - xp)) : t.progression.maxRank}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primaryLight },
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});
