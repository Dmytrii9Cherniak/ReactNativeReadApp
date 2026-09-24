import { useLocalSearchParams } from 'expo-router';

import { ReaderScreen } from '@/features/reader';

export default function ReaderRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ReaderScreen bookId={id} />;
}
