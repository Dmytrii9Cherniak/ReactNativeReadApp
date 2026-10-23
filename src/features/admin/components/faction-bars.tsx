import { StyleSheet, View } from 'react-native';

import { getFaction } from '@/features/progression';
import { useT } from '@/shared/i18n';
import { colors, radius, spacing } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

import type { AdminStats } from '../types';

/** Розподіл сталкерів за угрупованнями — смужки в кольорі угруповання. */
export function FactionBars({ factions }: { factions: AdminStats['factions'] }) {
  const t = useT();
  const max = Math.max(1, ...factions.map((item) => item.members));
  const sorted = [...factions].sort((a, b) => b.members - a.members);

  return (
    <Card>
      <Text variant="sectionLabel">{t.admin.factions}</Text>
      {sorted.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text variant="caption" style={styles.name} numberOfLines={1}>
            {t.factions[item.id]}
          </Text>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.round((item.members / max) * 100)}%`,
                  backgroundColor: getFaction(item.id).color,
                },
              ]}
            />
          </View>
          <Text variant="caption" style={styles.count}>
            {item.members.toLocaleString('uk-UA')}
          </Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { width: 84 },
  track: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  count: { width: 52, textAlign: 'right' },
});
