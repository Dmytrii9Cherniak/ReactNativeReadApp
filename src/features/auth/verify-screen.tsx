import { router } from 'expo-router';
import { useState } from 'react';

import { env } from '@/config/env';
import { DEMO_VERIFICATION_CODE } from '@/mock-backend';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { showMessage } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { Button, CenteredMessage, Screen, Text, TextField } from '@/shared/ui';

import { authApi } from './auth.api';
import { useAuthStore } from './auth.store';
import { FormError } from './components/form-error';
import { validateCode } from './lib/validation';

/** Підтвердження пошти кодом з листа. Після успіху користувач уже в системі. */
export function VerifyScreen({ email }: { email: string }) {
  const t = useT();
  const verify = useAuthStore((s) => s.verify);
  const [code, setCode] = useState('');
  const { submit, isSubmitting, error, setError } = useSubmit(verify);
  const resend = useSubmit(async () => {
    await authApi.resendCode(email);
    showMessage(t.auth.resent);
  });

  // Екран відкрито без пошти (пряме посилання, оновлення сторінки) — підтверджувати нічого
  if (!email) {
    return (
      <CenteredMessage title={t.auth.verifyTitle} description={t.errors.validation}>
        <Button title={t.auth.signup} onPress={() => router.replace('/signup')} />
      </CenteredMessage>
    );
  }

  const handleConfirm = () => {
    const invalid = validateCode(t, code);

    if (invalid) {
      setError(invalid);

      return;
    }

    void submit({ email, code: code.trim() });
  };

  return (
    <Screen gap={spacing.md}>
      <Text variant="body">{t.auth.codeSent(email)}</Text>
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
        onSubmitEditing={handleConfirm}
      />
      <FormError message={error ?? resend.error} />
      <Button title={t.auth.confirm} onPress={handleConfirm} loading={isSubmitting} />
      <Button
        title={t.auth.resend}
        variant="outline"
        onPress={() => void resend.submit()}
        loading={resend.isSubmitting}
      />
    </Screen>
  );
}
