import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOnline } from '@/shared/hooks/use-is-online';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

/**
 * Плашка «немає мережі» — внизу поверх застосунку, не зсуває екрани й не заважає
 * натисканням. Зникає сама, коли зв'язок повертається.
 */
export function OfflineBanner() {
  const t = useT();
  const isOnline = useIsOnline();
  const insets = useSafeAreaInsets();

  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.layer, { bottom: insets.bottom + spacing.lg }]}>
      <Animated.View
        entering={FadeInDown}
        exiting={FadeOutDown}
        accessibilityRole="alert"
        style={styles.pill}>
        <Icon name="wifi-off" size={14} color="warm" />
        <Text variant="caption" color="warm">
          {t.offline.banner}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.dangerBorder,
    backgroundColor: colors.warmSurface,
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
  },
});
