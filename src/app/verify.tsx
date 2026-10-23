import { useLocalSearchParams } from 'expo-router';

import { VerifyScreen } from '@/features/auth';

export default function VerifyRoute() {
  const { email } = useLocalSearchParams<{ email: string }>();

  return <VerifyScreen email={email} />;
}
