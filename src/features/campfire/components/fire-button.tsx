import { Pressable, StyleSheet, View } from 'react-native';

import { borderWidth, campfireColors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface FireButtonProps {
  count: number;
  isLit: boolean;
  /** Повний підпис «Розпалити — 116» (сторінка історії) або лише лічильник (картка) */
  label?: string;
  disabled?: boolean;
  onPress?: () => void;
}

/** Вогник під історією: +0.5 XP автору. Один з акаунта; запалений — підсвічений. */
export function FireButton({ count, isLit, label, disabled, onPress }: FireButtonProps) {
  const content = (
    <Text variant="caption" style={[styles.text, isLit && styles.litText]}>
      {`🔥 ${label ?? count}`}
    </Text>
  );

  // Без onPress — лише лічильник (картка стрічки). Не кнопка: на web кнопка в кнопці картки — помилка
  if (!onPress) {
    return <View style={[styles.button, isLit && styles.lit]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isLit, disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={spacing.xs}
      style={({ pressed }) => [styles.button, isLit && styles.lit, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: borderWidth.hairline,
    borderColor: campfireColors.buttonBorder,
    backgroundColor: campfireColors.buttonSurface,
  },
  lit: { borderColor: campfireColors.ember, backgroundColor: campfireColors.glowStrong },
  pressed: { opacity: 0.7 },
  text: { color: campfireColors.emberAccent, fontWeight: '600' },
  litText: { color: campfireColors.title },
});
