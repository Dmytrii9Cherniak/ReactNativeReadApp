import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { colors, spacing } from '@/shared/theme';

import type { ReactNode } from 'react';

interface ScreenProps {
  children: ReactNode;
  /** Колір тла (екрани «Біля вогнища» — темно-теплі) */
  backgroundColor?: string;
  /** Проміжок між блоками */
  gap?: number;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Типовий екран із прокруткою: відступи й колонка контенту обмеженої ширини,
 * щоб на планшеті форми й тексти не розтягувались на весь екран.
 */
export function Screen({
  children,
  backgroundColor = colors.background,
  gap = spacing.lg,
  footer,
  contentStyle,
}: ScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        indicatorStyle="white">
        <View style={[styles.column, { gap }, contentStyle]}>{children}</View>
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl },
  column: { width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' },
  footer: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    padding: spacing.lg,
  },
});
