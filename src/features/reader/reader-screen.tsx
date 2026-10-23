import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { catalogApi, useCatalogBook } from '@/features/catalog';
import { useAsync } from '@/shared/hooks/use-async';
import { useT } from '@/shared/i18n';
import { runInBackground } from '@/shared/lib/background';
import { spacing } from '@/shared/theme';
import { CenteredMessage, IconButton, Loader, Text } from '@/shared/ui';

import { AppearancePanel } from './components/appearance-panel';
import { ContentsPanel } from './components/contents-panel';
import { TextReader } from './components/text-reader';
import { useReadingPosition } from './reading-progress.store';

import type { FlashListRef } from '@shopify/flash-list';

/** Рідер: текст книги, «Зміст», «Aa» — вигляд тексту, відсоток прочитаного. */
export function ReaderScreen({ bookId }: { bookId: string }) {
  const t = useT();
  const book = useCatalogBook(bookId);
  const content = useAsync(`content:${bookId}`, () => catalogApi.getContent(bookId));
  const saved = useReadingPosition(bookId);
  const listRef = useRef<FlashListRef<string>>(null);
  const [fraction, setFraction] = useState<number | null>(null);
  const [paragraph, setParagraph] = useState(saved?.paragraph ?? 0);
  const [panel, setPanel] = useState<'appearance' | 'contents' | null>(null);

  const percent = Math.round(Math.min(1, Math.max(0, fraction ?? saved?.fraction ?? 0)) * 100);
  const chapters = content.status === 'ready' ? content.value.chapters : [];
  const isPdf = book.status === 'ready' && book.value.format === 'pdf';

  const goToParagraph = (index: number) => {
    setPanel(null);
    runInBackground(async () => listRef.current?.scrollToIndex({ index, animated: true }));
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: book.status === 'ready' ? book.value.title : '',
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text variant="mono">{`${percent}%`}</Text>
              {chapters.length > 0 ? (
                <IconButton
                  icon="list"
                  accessibilityLabel={t.reader.contents}
                  onPress={() => setPanel('contents')}
                />
              ) : null}
              <IconButton
                icon="type"
                accessibilityLabel={t.reader.appearance}
                onPress={() => setPanel('appearance')}
              />
            </View>
          ),
        }}
      />
      {content.status === 'loading' ? (
        <Loader />
      ) : content.status === 'error' ? (
        <CenteredMessage title={t.reader.openError} />
      ) : content.value.paragraphs.length === 0 ? (
        <CenteredMessage
          title={t.reader.openError}
          description={isPdf ? t.reader.pdfUnavailable : undefined}
        />
      ) : (
        <TextReader
          content={content.value}
          listRef={listRef}
          onProgress={(value, first) => {
            setFraction(value);
            setParagraph(first);
          }}
        />
      )}
      <AppearancePanel visible={panel === 'appearance'} onClose={() => setPanel(null)} />
      <ContentsPanel
        visible={panel === 'contents'}
        chapters={chapters}
        currentParagraph={paragraph}
        onSelect={goToParagraph}
        onClose={() => setPanel(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
