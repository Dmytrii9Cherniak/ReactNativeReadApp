import { router } from 'expo-router';
import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/use-submit';
import { Button, Checkbox, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthForm } from './components/auth-form';
import { toFormErrors } from './lib/form-errors';

export function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const { submit, isSubmitting, error } = useSubmit(async () => {
    await register({ name, email, password, acceptTerms });
    router.push({ pathname: '/verify-email', params: { email } });
  });

  const errors = toFormErrors(error);

  return (
    <AuthForm
      eyebrow="ПДА // Новий сталкер"
      title="Реєстрація"
      description="Після реєстрації на пошту прийде 6-значний код підтвердження."
      submitTitle="Зареєструватися"
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={errors.message}
      footer={
        <Button
          title="Вже є акаунт? Увійти"
          variant="ghost"
          onPress={() => router.replace('/login')}
        />
      }>
      <TextField
        label="Ім'я"
        value={name}
        onChangeText={setName}
        autoComplete="name"
        error={errors.fields.name}
      />
      <TextField
        label="Пошта"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        error={errors.fields.email}
      />
      <TextField
        label="Пароль (мінімум 8 символів)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        error={errors.fields.password}
      />
      <Checkbox
        checked={acceptTerms}
        onChange={setAcceptTerms}
        label="Я погоджуюсь з Умовами використання"
        error={errors.fields.acceptTerms}
      />
    </AuthForm>
  );
}
