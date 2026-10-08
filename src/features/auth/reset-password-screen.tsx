import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/use-submit';
import { TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthForm } from './components/auth-form';
import { toFormErrors } from './lib/form-errors';

export function ResetPasswordScreen({ email }: { email: string }) {
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const { submit, isSubmitting, error } = useSubmit(() => resetPassword({ email, code, password }));

  const errors = toFormErrors(error);

  return (
    <AuthForm
      eyebrow="ПДА // Відновлення"
      title="Новий пароль"
      description={`Якщо акаунт ${email} існує, на нього прийшов 6-значний код.`}
      submitTitle="Змінити пароль"
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={errors.message}>
      <TextField
        label="Код"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.fields.code}
      />
      <TextField
        label="Новий пароль (мінімум 8 символів)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        error={errors.fields.password}
      />
    </AuthForm>
  );
}
