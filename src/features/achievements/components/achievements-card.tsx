import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Card, Icon, Text } from '@/shared/ui';

import { useAchievements } from '../hooks/use-achievements';

/** Досягнення в профілі: отримані — золоті, решта — сірі з умовою. */
export function AchievementsCard() {
  const t = useT();
  const achievements = useAchievements();
  const unlocked = achievements.filter((item) => item.isUnlocked).length;

  return (
    <Card>
      <View style={styles.header}>
        <Text variant="sectionLabel">{t.achievements.title}</Text>
        <Text variant="caption" color="gold">
          {t.achievements.progress(unlocked, achievements.length)}
        </Text>
      </View>
      <View style={styles.grid}>
        {achievements.map(({ achievement, isUnlocked }) => {
          const text = t.achievements.items[achievement.id];

          return (
            <View
              key={achievement.id}
              accessibilityLabel={`${text.title}: ${text.description}`}
              style={[styles.item, isUnlocked && styles.unlocked]}>
              <Icon name={achievement.icon} color={isUnlocked ? 'gold' : 'textFaint'} />
              <Text
                variant="caption"
                color={isUnlocked ? 'text' : 'textMuted'}
                style={styles.title}>
                {text.title}
              </Text>
              <Text variant="caption" color="textFaint" style={styles.description}>
                {text.description}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  item: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 96,
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    opacity: 0.6,
  },
  unlocked: { opacity: 1, borderColor: colors.gold, backgroundColor: colors.goldSurface },
  title: { fontWeight: '700', textAlign: 'center' },
  description: { fontSize: 10, lineHeight: 13, textAlign: 'center' },
});
