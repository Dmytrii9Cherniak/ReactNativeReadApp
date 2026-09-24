import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, spacing } from '@/shared/theme';

import { Text } from './text';

interface InfoRowProps {
  label: string;
  value: string;
}

/** Рядок «ключ — значення» у стилі таблиці ПДА. */
export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.row}>
      <Text variant="mono">{label}</Text>
      <Text variant="label">{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
});
