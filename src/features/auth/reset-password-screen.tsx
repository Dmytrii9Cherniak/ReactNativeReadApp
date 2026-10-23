import { router } from 'expo-router';
import { useState } from 'react';

import { env } from '@/config/env';
import { DEMO_VERIFICATION_CODE } from '@/mock-backend';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Button, CenteredMessage, PasswordField, Screen, Text, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { FormError } from './components/form-error';
import { validateCode, validateNewPassword } from './lib/validation';

/** Крок 2: код з листа + новий пароль. Після успіху користувач одразу в системі. */
export function ResetPasswordScreen({ email }: { email: string }) {
  const t = useT();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const { submit, isSubmitting, error, setError } = useSubmit(resetPassword);

  // Відкрито напряму, без пошти з першого кроку
  if (!email) {
    return (
      <CenteredMessage title={t.auth.resetTitle} description={t.errors.validation}>
        <Button title={t.auth.forgotPassword} onPress={() => router.replace('/forgot-password')} />
      </CenteredMessage>
    );
  }

  const handleSave = () => {
    const invalid = validateCode(t, code) ?? validateNewPassword(t, password);

    if (invalid) {
      setError(invalid);

      return;
    }

    void submit({ email, code: code.trim(), password });
  };

  return (
    <Screen gap={spacing.md}>
      <Text variant="body">{t.auth.resetHint(email)}</Text>
      {env.isDemo ? (
        <Text variant="caption" color="primaryLight">
          {t.auth.demoCode(DEMO_VERIFICATION_CODE)}
        </Text>
      ) : null}
      <TextField
        value={code}
        onChangeText={setCode}
        placeholder={t.auth.code}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
      />
      <PasswordField
        value={password}
        onChangeText={setPassword}
        placeholder={t.auth.newPassword}
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={handleSave}
      />
      <FormError message={error} />
      <Button title={t.auth.saveAndLogin} onPress={handleSave} loading={isSubmitting} />
    </Screen>
  );
}
