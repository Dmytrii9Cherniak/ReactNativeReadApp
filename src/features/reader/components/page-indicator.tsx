import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface PageIndicatorProps {
  page: number;
  pageCount: number;
}

/** Плашка «СТОР. 12 / 340» поверх рідера. */
export function PageIndicator({ page, pageCount }: PageIndicatorProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      <Text variant="mono" color="primary">
        Стор. {page} / {pageCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
