import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { catalogApi, useCatalogBook } from '@/features/catalog';
import { useAsync } from '@/shared/hooks/use-async';
import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { CenteredMessage, IconButton, Loader, Text } from '@/shared/ui';

import { AppearancePanel } from './components/appearance-panel';
import { TextReader } from './components/text-reader';
import { useReadingPosition } from './reading-progress.store';

/** Рідер: текст книги з каталогу, «Aa» — вигляд тексту, відсоток прочитаного. */
export function ReaderScreen({ bookId }: { bookId: string }) {
  const t = useT();
  const book = useCatalogBook(bookId);
  const content = useAsync(`content:${bookId}`, () => catalogApi.getContent(bookId));
  const saved = useReadingPosition(bookId);
  const [fraction, setFraction] = useState<number | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const percent = Math.round((fraction ?? saved?.fraction ?? 0) * 100);

  return (
    <>
      <Stack.Screen
        options={{
          title: book.status === 'ready' ? book.value.title : '',
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text variant="mono">{`${percent}%`}</Text>
              <IconButton
                icon="type"
                accessibilityLabel={t.reader.appearance}
                onPress={() => setIsPanelOpen(true)}
              />
            </View>
          ),
        }}
      />
      {content.status === 'loading' ? (
        <Loader />
      ) : content.status === 'error' ? (
        <CenteredMessage title={t.reader.openError} />
      ) : (
        <TextReader content={content.value} onProgress={setFraction} />
      )}
      <AppearancePanel visible={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
