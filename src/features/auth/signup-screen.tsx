import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { goBack } from '@/shared/lib/navigation';
import { spacing } from '@/shared/theme';
import { Button, Checkbox, Screen, Text, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthLink } from './components/auth-link';
import { FormError } from './components/form-error';
import { validateSignup } from './lib/validation';

/**
 * Макет, екран 4. «Я не робот» — місце для Cloudflare Turnstile:
 * з бекендом тут з'явиться віджет, а його токен піде разом із запитом.
 */
export function SignupScreen() {
  const t = useT();
  const signup = useAuthStore((s) => s.signup);
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { submit, isSubmitting, error, setError } = useSubmit(async () => {
    await signup({ nickname, email, password });
    router.push({ pathname: '/verify', params: { email: email.trim() } });
  });

  const handleSignup = () => {
    const invalid = validateSignup(t, { nickname, email, password, isHuman, agreed });

    if (invalid) {
      setError(invalid);

      return;
    }

    void submit();
  };

  return (
    <Screen gap={spacing.md}>
      <TextField value={nickname} onChangeText={setNickname} placeholder={t.auth.nickname} />
      <TextField
        value={email}
        onChangeText={setEmail}
        placeholder={t.auth.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <TextField
        value={password}
        onChangeText={setPassword}
        placeholder={t.auth.passwordNew}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
      />
      <Checkbox boxed checked={isHuman} onChange={setIsHuman} label={t.auth.notRobot} />
      <Checkbox
        checked={agreed}
        onChange={setAgreed}
        label={
          <Text
            variant="caption"
            color="primaryLight"
            style={styles.terms}
            onPress={() => router.push('/terms')}>
            {t.auth.agreeTerms}
          </Text>
        }
      />
      <FormError message={error} />
      <Button title={t.auth.createAccount} onPress={handleSignup} loading={isSubmitting} />
      <AuthLink question={t.auth.haveAccount} action={t.auth.login} onPress={goBack} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  terms: { flex: 1, textDecorationLine: 'underline' },
});
