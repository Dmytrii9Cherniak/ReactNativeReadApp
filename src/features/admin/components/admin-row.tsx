import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, colors, spacing } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';

import type { ReactNode } from 'react';

interface AdminRowProps {
  title: string;
  subtitle?: string;
  /** Бейдж статусу, ранг тощо — під підзаголовком */
  meta?: ReactNode;
  onPress?: () => void;
  children?: ReactNode;
}

/** Рядок списку адмінки: назва, підпис, бейджі; зі стрілкою, якщо веде на картку. */
export function AdminRow({ title, subtitle, meta, onPress, children }: AdminRowProps) {
  const content = (
    <>
      <View style={styles.main}>
        <View style={styles.info}>
          <Text variant="bookTitle" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
          {meta}
        </View>
        {onPress ? <Icon name="chevron-right" size={16} /> : null}
      </View>
      {children}
    </>
  );

  // Без onPress — звичайний блок: усередині можуть бути власні кнопки (кнопка в кнопці на web — помилка)
  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.hairline,
    borderBottomColor: colors.border,
  },
  main: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: spacing.xs },
  pressed: { backgroundColor: colors.surfaceAlt },
});
