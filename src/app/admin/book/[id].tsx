import { useLocalSearchParams } from 'expo-router';

import { AdminBookScreen } from '@/features/admin';

export default function AdminBookRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <AdminBookScreen bookId={id} />;
}
