import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';

import { Icon } from './icon';
import { Text } from './text';

import type { ReactNode } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  /** Рамка навколо (блок «Я не робот») */
  boxed?: boolean;
}

export function Checkbox({ checked, onChange, label, boxed = false }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={[styles.row, boxed && styles.boxed]}>
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <Icon name="check" size={14} color="primaryPale" /> : null}
      </View>
      {typeof label === 'string' ? (
        <Text variant="caption" color="textSecondary" style={styles.label}>
          {label}
        </Text>
      ) : (
        label
      )}
    </Pressable>
  );
}

const BOX_SIZE = 22;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  boxed: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: borderWidth.accent,
    borderColor: colors.borderActive,
  },
  checked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { flex: 1 },
});
