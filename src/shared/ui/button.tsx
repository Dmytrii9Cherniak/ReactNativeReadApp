import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, spacing, type ColorToken } from '@/shared/theme';

import { Text } from './text';

type ButtonVariant = 'primary' | 'outline';

const labelColor: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  outline: 'primary',
};

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

export function Button({ title, variant = 'primary', style, ...props }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed, style]}
      {...props}>
      <Text variant="heading" color={labelColor[variant]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderColor: colors.primary },
  pressed: { opacity: 0.7 },
});
