import { useLocalSearchParams } from 'expo-router';

import { ForgotPasswordScreen } from '@/features/auth';

export default function ForgotPasswordRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return <ForgotPasswordScreen initialEmail={email ?? ''} />;
}
