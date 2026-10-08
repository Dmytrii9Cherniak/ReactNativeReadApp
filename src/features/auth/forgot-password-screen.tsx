import { router } from 'expo-router';
import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/use-submit';
import { TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthForm } from './components/auth-form';
import { toFormErrors } from './lib/form-errors';

export function ForgotPasswordScreen() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword);
  const [email, setEmail] = useState('');

  const { submit, isSubmitting, error } = useSubmit(async () => {
    await forgotPassword(email);
    router.push({ pathname: '/reset-password', params: { email } });
  });

  const errors = toFormErrors(error);

  return (
    <AuthForm
      eyebrow="ПДА // Відновлення"
      title="Забули пароль"
      description="Вкажи пошту акаунту — надішлемо код для скидання пароля."
      submitTitle="Надіслати код"
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={errors.message}>
      <TextField
        label="Пошта"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={errors.fields.email}
      />
    </AuthForm>
  );
}
