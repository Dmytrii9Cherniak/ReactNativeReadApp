import { Pressable, StyleSheet } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';

import { Text } from './text';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

/** Перемикач-«пігулка»: полиці на сторінці книги, мова тощо. */
export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}>
      <Text variant="label" color={selected ? 'primaryPale' : 'textSecondary'}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.primaryActive, borderColor: colors.primary },
  pressed: { opacity: 0.8 },
});
