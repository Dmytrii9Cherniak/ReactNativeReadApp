import { useLocalSearchParams } from 'expo-router';

import { AdminUserScreen } from '@/features/admin';

export default function AdminUserRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AdminUserScreen userId={id} />;
}
