import { StyleSheet } from 'react-native';

import { spacing, type ColorToken } from '@/shared/theme';
import { Card, Text } from '@/shared/ui';

interface StatTileProps {
  value: number;
  label: string;
  color?: ColorToken;
}

export function StatTile({ value, label, color = 'text' }: StatTileProps) {
  return (
    <Card style={styles.tile}>
      <Text variant="display" color={color}>
        {value.toLocaleString('uk-UA')}
      </Text>
      <Text variant="caption" numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flexBasis: '30%', flexGrow: 1, minWidth: 96, gap: spacing.xs },
});
