import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

/**
 * Бейдж «non stop» — 90 днів поспіль з історією. Не зникає;
 * за кожну наступну завершену серію — лічильник «×2», «×3»…
 */
export function NonStopBadge({ count = 1 }: { count?: number }) {
  return (
    <View style={styles.badge} accessibilityLabel={`non stop ×${count}`}>
      <Text variant="caption" color="onEmber" style={styles.text}>
        {count > 1 ? `🔥 non stop ×${count}` : '🔥 non stop'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.ember,
  },
  text: { fontSize: 10, lineHeight: 14, fontWeight: '700' },
});
