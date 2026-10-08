import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { colors, spacing } from '@/shared/theme';
import { Button, Text } from '@/shared/ui';

import type { ReactNode } from 'react';

interface AuthFormProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  submitTitle: string;
  onSubmit: () => void;
  isSubmitting: boolean;
  /** Загальна помилка форми */
  error: string | null;
  /** Посилання під кнопкою */
  footer?: ReactNode;
}

/** Каркас екранів входу / реєстрації / кодів: поля, помилка, кнопка, посилання. */
export function AuthForm({
  eyebrow,
  title,
  description,
  children,
  submitTitle,
  onSubmit,
  isSubmitting,
  error,
  footer,
}: AuthFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="mono">{eyebrow}</Text>
          <Text variant="title">{title}</Text>
          {description ? <Text variant="caption">{description}</Text> : null}
        </View>

        {children}

        {error ? (
          <Text variant="caption" color="danger">
            {error}
          </Text>
        ) : null}

        <Button
          title={isSubmitting ? 'Зачекай…' : submitTitle}
          disabled={isSubmitting}
          onPress={onSubmit}
        />

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: {
    gap: spacing.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
  },
  header: { gap: spacing.xs, paddingBottom: spacing.sm },
  footer: { alignItems: 'center', gap: spacing.xs },
});
