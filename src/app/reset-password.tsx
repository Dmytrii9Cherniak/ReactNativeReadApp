import { useLocalSearchParams } from 'expo-router';

import { ResetPasswordScreen } from '@/features/auth';

export default function ResetPasswordRoute() {
  const { email } = useLocalSearchParams<{ email?: string }>();

  return <ResetPasswordScreen email={email ?? ''} />;
}
