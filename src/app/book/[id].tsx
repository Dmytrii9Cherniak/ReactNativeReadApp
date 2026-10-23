import { useLocalSearchParams } from 'expo-router';

import { BookDetailScreen } from '@/features/book';

export default function BookRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <BookDetailScreen bookId={id} />;
}
