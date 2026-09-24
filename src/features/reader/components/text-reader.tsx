import { ScrollView, StyleSheet } from 'react-native';

import type { Book } from '@/features/library';
import { colors, spacing } from '@/shared/theme';
import { CenteredMessage, Loader, Text } from '@/shared/ui';

import { useBookText } from '../hooks/use-book-text';

export function TextReader({ book }: { book: Book }) {
  const state = useBookText(book);

  if (state.status === 'loading') {
    return <Loader />;
  }

  if (state.status === 'error') {
    return <CenteredMessage title="Не вдалося прочитати файл" description={state.message} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="reading">{state.text}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
});
