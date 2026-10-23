import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { Card, Icon, Text, type IconName } from '@/shared/ui';

import { roundXp } from '../lib/ranks';
import { XP_LIMITS } from '../lib/xp-limits';

import type { TodayXp } from '../types';

/** Блок «Сьогодні»: звідки береться XP за день (дизайн-документ, розділ 2). */
export function TodayCard({ today }: { today: TodayXp }) {
  const t = useT();
  const firesXp = today.fires * XP_LIMITS.fireXp;
  const total = roundXp(today.story + firesXp + today.adXp);

  return (
    <Card>
      <Text variant="sectionLabel">{t.progression.today}</Text>
      <Row icon="book" label={t.progression.todayStory} xp={today.story} />
      <Row
        icon="zap"
        label={t.progression.todayFires(today.fires, XP_LIMITS.firesPerDay)}
        xp={roundXp(firesXp)}
      />
      <Row
        icon="heart"
        label={t.progression.todayAds(today.ads, XP_LIMITS.adsPerDay)}
        xp={today.adXp}
      />
      <View style={[styles.row, styles.total]}>
        <Text variant="caption">{t.progression.todayTotal}</Text>
        <Text variant="label" color="primaryLight">{`+${total} XP`}</Text>
      </View>
    </Card>
  );
}

function Row({ icon, label, xp }: { icon: IconName; label: string; xp: number }) {
  return (
    <View style={styles.row}>
      <View style={styles.label}>
        <Icon name={icon} size={14} />
        <Text variant="caption" color="textSecondary">
          {label}
        </Text>
      </View>
      <Text variant="caption" color="primaryLight" style={styles.bold}>{`+${xp} XP`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  label: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  total: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
  },
  bold: { fontWeight: '700' },
});
