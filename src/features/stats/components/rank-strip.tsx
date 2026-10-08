import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { borderWidth, colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { formatPages } from '../lib/pages';
import { getRankStatus } from '../lib/ranks';
import { useTodayPages, useTotalPages } from '../stats.store';

/** Компактний рядок для шапки: ранг і прочитане сьогодні. Натискання — у профіль. */
export function RankStrip() {
  const { rank, level } = getRankStatus(useTotalPages());
  const todayPages = useTodayPages();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.navigate('/profile')}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
      <Text variant="mono" color="primary">
        {`Ранг ${level} // ${rank.title}`}
      </Text>
      <Text variant="mono" style={styles.today}>
        {`Сьогодні: ${formatPages(todayPages)}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceRaised },
  today: { marginLeft: 'auto' },
});
