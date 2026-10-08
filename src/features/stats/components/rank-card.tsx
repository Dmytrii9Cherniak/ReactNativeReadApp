import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { ProgressBar, Text } from '@/shared/ui';

import { RANKS, getRankStatus } from '../lib/ranks';

/** Поточний ранг і прогрес до наступного. */
export function RankCard({ totalPages }: { totalPages: number }) {
  const { rank, level, next, progress, pagesToNext } = getRankStatus(totalPages);

  return (
    <View style={styles.card}>
      <Text variant="mono">{`Ранг ${level} / ${RANKS.length}`}</Text>
      <Text variant="title">{rank.title}</Text>
      <Text variant="caption">{rank.description}</Text>
      <ProgressBar value={progress} />
      {next ? (
        <Text variant="mono">{`Ще ${Math.ceil(pagesToNext)} стор. до «${next.title}»`}</Text>
      ) : (
        <Text variant="mono" color="primary">
          Найвищий ранг
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    borderLeftWidth: borderWidth.accent,
    borderLeftColor: colors.primary,
    backgroundColor: colors.surface,
  },
});
