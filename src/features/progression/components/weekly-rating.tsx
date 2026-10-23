import { StyleSheet, View } from 'react-native';

import { useAsync } from '@/shared/hooks/use-async';
import { useT } from '@/shared/i18n';
import { colors, radius, spacing } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

import { getFaction } from '../lib/factions';
import { progressionApi } from '../progression.api';

import type { FactionId } from '../types';

/** Рейтинг угруповань за тиждень (дизайн-документ, розділ 7): місце, смужка, XP. */
export function WeeklyRating({ currentFaction }: { currentFaction: FactionId }) {
  const t = useT();
  const rating = useAsync('faction-rating', () => progressionApi.getWeeklyRating());

  if (rating.status !== 'ready') {
    return null;
  }

  const max = Math.max(1, ...rating.value.map((item) => item.weekXp));

  return (
    <Card>
      <Text variant="sectionLabel">{t.rating.title}</Text>
      <Text variant="caption" color="textFaint">
        {t.rating.hint}
      </Text>
      {rating.value.map((item, index) => {
        const isMine = item.id === currentFaction;

        return (
          <View key={item.id} style={styles.row}>
            <Text variant="label" color={index === 0 ? 'gold' : 'textFaint'} style={styles.place}>
              {index + 1}
            </Text>
            <View style={styles.info}>
              <Text
                variant="caption"
                color={isMine ? 'gold' : 'text'}
                style={isMine && styles.bold}>
                {isMine ? `${t.factions[item.id]} · ${t.rating.yours}` : t.factions[item.id]}
              </Text>
              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.round((item.weekXp / max) * 100)}%`,
                      backgroundColor: getFaction(item.id).color,
                    },
                  ]}
                />
              </View>
            </View>
            <Text variant="caption" style={styles.xp}>
              {t.rating.weekXp(item.weekXp)}
            </Text>
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  place: { width: 18 },
  info: { flex: 1, gap: spacing.xs },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
  xp: { width: 80, textAlign: 'right' },
  bold: { fontWeight: '700' },
});
