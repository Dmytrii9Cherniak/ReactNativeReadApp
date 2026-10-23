import { router } from 'expo-router';
import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Button, Screen, Text, TextField } from '@/shared/ui';

import { authApi } from './auth.api';
import { FormError } from './components/form-error';
import { validateEmail } from './lib/validation';

/** Крок 1 відновлення пароля: пошта → код на пошту. */
export function ForgotPasswordScreen({ initialEmail }: { initialEmail: string }) {
  const t = useT();
  const [email, setEmail] = useState(initialEmail);
  const { submit, isSubmitting, error, setError } = useSubmit(async () => {
    await authApi.requestPasswordReset(email.trim());
    router.replace({ pathname: '/reset-password', params: { email: email.trim() } });
  });

  const handleSend = () => {
    const invalid = validateEmail(t, email);

    if (invalid) {
      setError(invalid);

      return;
    }

    void submit();
  };

  return (
    <Screen gap={spacing.md}>
      <Text variant="body">{t.auth.forgotHint}</Text>
      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder={t.auth.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        onSubmitEditing={handleSend}
      />
      <FormError message={error} />
      <Button title={t.auth.sendCode} onPress={handleSend} loading={isSubmitting} />
    </Screen>
  );
}
