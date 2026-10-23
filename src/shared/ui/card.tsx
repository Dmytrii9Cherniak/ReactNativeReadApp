import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, colors, radius, spacing } from '@/shared/theme';

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Блок-картка: «Досвід», «Сьогодні», налаштування. */
export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
