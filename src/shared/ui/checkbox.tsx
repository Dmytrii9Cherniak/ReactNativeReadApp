import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';

import { Text } from './text';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
}

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        onPress={() => onChange(!checked)}
        style={styles.row}>
        <View style={[styles.box, checked && styles.boxChecked, error ? styles.boxError : null]}>
          {checked ? (
            <Text variant="mono" color="onPrimary">
              ✓
            </Text>
          ) : null}
        </View>
        <Text variant="caption" color="foreground" style={styles.label}>
          {label}
        </Text>
      </Pressable>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const BOX_SIZE = 20;

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.primary,
  },
  boxChecked: { backgroundColor: colors.primary },
  boxError: { borderColor: colors.danger },
  label: { flex: 1 },
});
