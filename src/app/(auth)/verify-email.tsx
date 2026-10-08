import { useLocalSearchParams } from 'expo-router';

import { VerifyEmailScreen } from '@/features/auth';

export default function VerifyEmailRoute() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return <VerifyEmailScreen email={email} />;
}
