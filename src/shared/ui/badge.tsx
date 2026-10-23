import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing, type ColorToken } from '@/shared/theme';

import { Text } from './text';

export type BadgeTone = 'gold' | 'success' | 'muted' | 'danger';

const TONES: Record<BadgeTone, { color: ColorToken; background: ColorToken }> = {
  gold: { color: 'gold', background: 'goldSurface' },
  success: { color: 'success', background: 'successSurface' },
  muted: { color: 'textMuted', background: 'input' },
  danger: { color: 'danger', background: 'dangerSurface' },
};

/** Маленька позначка стану: «На перевірці», «Опубліковано»… */
export function Badge({ label, tone }: { label: string; tone: BadgeTone }) {
  const look = TONES[tone];

  return (
    <View style={[styles.badge, { backgroundColor: colors[look.background] }]}>
      <Text variant="caption" color={look.color} style={styles.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
});
