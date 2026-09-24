import { StyleSheet, View } from 'react-native';

import { borderWidth, colors, spacing } from '@/shared/theme';

import { Text } from './text';

import type { ReactNode } from 'react';

interface ScreenHeaderProps {
  title: string;
  /** Маленький підпис над заголовком, напр. «ПДА // 01» */
  eyebrow?: string;
  /** Дія праворуч (кнопка) */
  action?: ReactNode;
}

export function ScreenHeader({ title, eyebrow, action }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        {eyebrow ? <Text variant="mono">{eyebrow}</Text> : null}
        <Text variant="title">{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  titles: { flex: 1, gap: spacing.xs },
});
