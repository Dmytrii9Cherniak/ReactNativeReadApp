import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { colors, radius, spacing } from '@/shared/theme';
import { Card, Chip, Text } from '@/shared/ui';

import { DAILY_GOALS, summarize, useReadingStatsStore } from '../reading-stats.store';

const BAR_HEIGHT = 56;

/** Статистика читання в профілі: ціль на день, тиждень стовпчиками, серія, дочитані книги. */
export function ReadingStatsCard() {
  const t = useT();
  const days = useReadingStatsStore((s) => s.days);
  const finishedBookIds = useReadingStatsStore((s) => s.finishedBookIds);
  const hasReadAtNight = useReadingStatsStore((s) => s.hasReadAtNight);
  const dailyGoal = useReadingStatsStore((s) => s.dailyGoal);
  const setDailyGoal = useReadingStatsStore((s) => s.setDailyGoal);
  const summary = summarize({ days, finishedBookIds, hasReadAtNight });
  const todayIndex = (new Date().getDay() + 6) % 7;
  const maxMinutes = Math.max(dailyGoal, ...summary.week);
  const goalProgress = Math.min(1, summary.todayMinutes / dailyGoal);

  return (
    <Card>
      <Text variant="sectionLabel">{t.stats.title}</Text>
      <Text variant="label" color={goalProgress >= 1 ? 'success' : 'text'}>
        {goalProgress >= 1 ? t.stats.goalReached : t.stats.today(summary.todayMinutes, dailyGoal)}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(goalProgress * 100)}%` }]} />
      </View>

      <View style={styles.week}>
        {summary.week.map((minutes, index) => (
          <View key={index} style={styles.day}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.bar,
                  { height: Math.max(2, Math.round((minutes / maxMinutes) * BAR_HEIGHT)) },
                  minutes >= dailyGoal && styles.barGoal,
                ]}
              />
            </View>
            <Text variant="caption" color={index === todayIndex ? 'primaryLight' : 'textFaint'}>
              {t.stats.weekdays[index]}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.facts}>
        <Text variant="caption">{t.stats.streak(summary.streak)}</Text>
        <Text variant="caption">{t.stats.finished(summary.finishedBooks)}</Text>
      </View>

      <Text variant="sectionLabel">{t.stats.goal}</Text>
      <View style={styles.goals}>
        {DAILY_GOALS.map((goal) => (
          <Chip
            key={goal}
            label={t.stats.minutes(goal)}
            selected={goal === dailyGoal}
            onPress={() => setDailyGoal(goal)}
          />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primaryLight },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  day: { alignItems: 'center', gap: spacing.xs, flex: 1 },
  barTrack: { height: BAR_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 14, borderRadius: radius.sm, backgroundColor: colors.borderActive },
  barGoal: { backgroundColor: colors.primary },
  facts: { flexDirection: 'row', justifyContent: 'space-between' },
  goals: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
