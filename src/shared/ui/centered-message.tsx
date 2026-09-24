import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/shared/theme';

import { Text } from './text';

interface CenteredMessageProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

/** Порожній стан / помилка / заглушка по центру екрану. */
export function CenteredMessage({ title, description, children }: CenteredMessageProps) {
  return (
    <View style={styles.container}>
      <Text variant="heading">{title}</Text>
      {description ? (
        <Text variant="caption" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  description: { textAlign: 'center' },
});
