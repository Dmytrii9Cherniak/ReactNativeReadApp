import { Pressable, StyleSheet } from 'react-native';

import { releaseFocus } from '@/shared/lib/focus';
import { spacing, type ColorToken } from '@/shared/theme';

import { Icon, type IconName } from './icon';

interface IconButtonProps {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  color?: ColorToken;
  size?: number;
}

/** Кнопка-іконка для шапки: «Aa» в рідері, ☰ тощо. */
export function IconButton({
  icon,
  onPress,
  accessibilityLabel,
  color = 'textSecondary',
  size = 20,
}: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={spacing.sm}
      onPress={() => {
        releaseFocus();
        onPress();
      }}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Icon name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: spacing.sm },
  pressed: { opacity: 0.6 },
});
