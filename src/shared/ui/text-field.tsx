import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { borderWidth, colors, radius, spacing, typography } from '@/shared/theme';

export interface TextFieldProps extends TextInputProps {
  invalid?: boolean;
}

/** Поле вводу з макета: темне тло, тонка рамка, плейсхолдер замість підпису. */
export function TextField({ invalid = false, multiline, style, ...props }: TextFieldProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      selectionColor={colors.primaryLight}
      multiline={multiline}
      style={[styles.input, multiline && styles.multiline, invalid && styles.invalid, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.input,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  invalid: { borderColor: colors.danger },
});
