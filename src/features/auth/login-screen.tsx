import { router } from 'expo-router';
import { useState } from 'react';

import { env } from '@/config/env';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { Button, Screen, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthLink } from './components/auth-link';
import { DemoAccounts } from './components/demo-accounts';
import { FormError } from './components/form-error';
import { validateLogin } from './lib/validation';

/** Макет, екран 3. Після входу екран зникає сам (маршрут доступний лише гостям). */
export function LoginScreen() {
  const t = useT();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { submit, isSubmitting, error, setError } = useSubmit(login);

  const handleLogin = () => {
    const invalid = validateLogin(t, email, password);

    if (invalid) {
      setError(invalid);

      return;
    }

    void submit({ email, password });
  };

  const pickDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <Screen gap={spacing.md}>
      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder={t.auth.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
      />
      <TextField
        value={password}
        onChangeText={setPassword}
        placeholder={t.auth.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={handleLogin}
      />
      <FormError message={error} />
      <Button title={t.auth.login} onPress={handleLogin} loading={isSubmitting} />
      <AuthLink
        question={t.auth.noAccount}
        action={t.auth.signup}
        onPress={() => router.push('/signup')}
      />
      {env.isDemo ? <DemoAccounts onPick={pickDemo} /> : null}
    </Screen>
  );
}
