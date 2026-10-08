import { router } from 'expo-router';
import { useState } from 'react';

import { isApiError } from '@/shared/api';
import { useSubmit } from '@/shared/hooks/use-submit';
import { Button, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthForm } from './components/auth-form';
import { toFormErrors } from './lib/form-errors';

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { submit, isSubmitting, error } = useSubmit(async () => {
    try {
      await login(email, password);
    } catch (caught) {
      // Сервер уже надіслав новий код — ведемо на його введення
      if (isApiError(caught, 'email_not_verified')) {
        router.push({ pathname: '/verify-email', params: { email } });

        return;
      }

      throw caught;
    }
  });

  const errors = toFormErrors(error);

  return (
    <AuthForm
      eyebrow="ПДА // Доступ"
      title="Вхід"
      submitTitle="Увійти"
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={errors.message}
      footer={
        <>
          <Button
            title="Забули пароль?"
            variant="ghost"
            onPress={() => router.push('/forgot-password')}
          />
          <Button
            title="Немає акаунту? Реєстрація"
            variant="ghost"
            onPress={() => router.replace('/register')}
          />
        </>
      }>
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
        label="Пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        error={errors.fields.password}
      />
    </AuthForm>
  );
}
