import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { borderWidth, colors, radius, spacing, typography } from '@/shared/theme';

import { Text } from './text';

export interface TextFieldProps extends TextInputProps {
  label: string;
  /** Текст помилки під полем; поле підсвічується */
  error?: string;
}

export function TextField({ label, error, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.field}>
      <Text variant="mono">{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={colors.primary}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...props}
      />
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  input: {
    ...typography.body,
    color: colors.foreground,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
});
