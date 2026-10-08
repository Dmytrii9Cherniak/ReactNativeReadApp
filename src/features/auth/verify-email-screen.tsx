import { useState } from 'react';

import { useSubmit } from '@/shared/hooks/use-submit';
import { Button, Text, TextField } from '@/shared/ui';

import { useAuthStore } from './auth.store';
import { AuthForm } from './components/auth-form';
import { toFormErrors } from './lib/form-errors';

/** Після успіху сесія з'являється, і роутер сам закриває екрани входу (Stack.Protected). */
export function VerifyEmailScreen({ email }: { email: string }) {
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const resendVerification = useAuthStore((s) => s.resendVerification);
  const [code, setCode] = useState('');
  const [isResent, setResent] = useState(false);

  const { submit, isSubmitting, error } = useSubmit(() => verifyEmail(email, code));

  const resend = useSubmit(async () => {
    await resendVerification(email);
    setResent(true);
  });

  const errors = toFormErrors(error ?? resend.error);

  return (
    <AuthForm
      eyebrow="ПДА // Підтвердження"
      title="Код з листа"
      description={`Ми надіслали 6-значний код на ${email}. Він діє 15 хвилин.`}
      submitTitle="Підтвердити"
      onSubmit={submit}
      isSubmitting={isSubmitting}
      error={errors.message}
      footer={
        <>
          <Button
            title="Надіслати код ще раз"
            variant="ghost"
            disabled={resend.isSubmitting}
            onPress={resend.submit}
          />
          {isResent ? (
            <Text variant="caption">Новий код надіслано (не частіше разу на хвилину)</Text>
          ) : null}
        </>
      }>
      <TextField
        label="Код"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        maxLength={6}
        error={errors.fields.code}
      />
    </AuthForm>
  );
}
