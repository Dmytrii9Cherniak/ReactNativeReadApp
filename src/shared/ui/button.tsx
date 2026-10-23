import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { borderWidth, colors, radius, spacing, type ColorToken } from '@/shared/theme';

import { Icon, type IconName } from './icon';
import { Text } from './text';

/**
 * primary — головна дія (олива); outline — другорядна;
 * warm — «Переглянути рекламу»; ember — дії «Біля вогнища»;
 * success / danger — «Схвалити» / «Відхилити».
 */
type ButtonVariant = 'primary' | 'outline' | 'warm' | 'ember' | 'success' | 'danger';

const contentColor: Record<ButtonVariant, ColorToken> = {
  primary: 'onPrimary',
  outline: 'textSecondary',
  warm: 'warm',
  ember: 'onEmber',
  success: 'success',
  danger: 'danger',
};

/** md — звичайна кнопка форми; sm — компактна (плаваюча кнопка, дії в рядку списку). */
type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  /** Без підпису — кнопка-іконка (потрібен accessibilityLabel) */
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled) || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        !title && styles.iconOnly,
        size === 'sm' && styles.sm,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color={colors[contentColor[variant]]} />
      ) : icon ? (
        <Icon name={icon} size={size === 'sm' ? 14 : 16} color={contentColor[variant]} />
      ) : null}
      {title ? (
        <Text variant="label" color={contentColor[variant]} style={size === 'sm' && styles.smLabel}>
          {title}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
  },
  iconOnly: { minWidth: 44, paddingHorizontal: spacing.md },
  sm: { minHeight: 34, minWidth: 34, gap: spacing.xs, paddingHorizontal: spacing.md },
  smLabel: { fontSize: 13, lineHeight: 16 },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderColor: colors.borderActive },
  warm: { backgroundColor: colors.warmSurface, borderColor: colors.dangerBorder },
  ember: { backgroundColor: colors.ember, borderColor: colors.ember, borderRadius: radius.pill },
  success: { backgroundColor: colors.successSurface, borderColor: colors.primaryActive },
  danger: { backgroundColor: colors.dangerSurface, borderColor: colors.dangerBorder },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.5 },
});
