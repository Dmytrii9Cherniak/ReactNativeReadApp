import { ScrollView, StyleSheet, View } from 'react-native';

import { AccountCard } from '@/features/auth';
import { TAB_BAR_INSET } from '@/shared/constants/layout';
import { spacing } from '@/shared/theme';
import { InfoRow, Screen, ScreenHeader, Text } from '@/shared/ui';

import { RankCard } from './components/rank-card';
import { RankList } from './components/rank-list';
import { formatPages } from './lib/pages';
import { useTodayPages, useTotalPages } from './stats.store';

export function StatsScreen() {
  const totalPages = useTotalPages();
  const todayPages = useTodayPages();

  return (
    <Screen>
      <ScreenHeader eyebrow="ПДА // Профіль" title="Профіль" />

      <ScrollView contentContainerStyle={styles.content}>
        <AccountCard />

        <RankCard totalPages={totalPages} />

        <View>
          <Text variant="heading">Прочитано</Text>
          <InfoRow label="Сьогодні" value={formatPages(todayPages)} />
          <InfoRow label="Всього" value={formatPages(totalPages)} />
        </View>

        <View>
          <Text variant="heading">Ранги</Text>
          <RankList totalPages={totalPages} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: TAB_BAR_INSET + spacing.lg,
  },
});
