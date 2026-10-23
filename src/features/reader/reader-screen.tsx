import { Stack } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { catalogApi, useCatalogBook } from '@/features/catalog';
import type { BookContent } from '@/features/catalog';
import { readDownloadedContent, useDownload } from '@/features/downloads';
import { useAsync } from '@/shared/hooks/use-async';
import { useShare } from '@/shared/hooks/use-share';
import { useT } from '@/shared/i18n';
import { runInBackground } from '@/shared/lib/background';
import { notify } from '@/shared/lib/dialogs';
import { spacing } from '@/shared/theme';
import { CenteredMessage, IconButton, Loader, Text } from '@/shared/ui';

import { useBookBookmarks, useBookmarksStore } from './bookmarks.store';
import { AppearancePanel } from './components/appearance-panel';
import { ListenBar } from './components/listen-bar';
import { NavigatorPanel } from './components/navigator-panel';
import { ParagraphSheet } from './components/paragraph-sheet';
import { SearchPanel } from './components/search-panel';
import { TextReader } from './components/text-reader';
import { useReadAloud } from './hooks/use-read-aloud';
import { useReadingTime } from './hooks/use-reading-time';
import { useReadingPosition } from './reading-progress.store';
import { useReadingStatsStore } from './reading-stats.store';

import type { FlashListRef } from '@shopify/flash-list';

/** Дочитано, якщо видно останні 2% тексту. */
const FINISHED_FRACTION = 0.98;
/** Довгий абзац у цитаті обрізаємо — месенджери не люблять «простирадла». */
const QUOTE_MAX_LENGTH = 400;

const toQuote = (text: string) =>
  text.length > QUOTE_MAX_LENGTH ? `${text.slice(0, QUOTE_MAX_LENGTH).trimEnd()}…` : text;

type Panel = 'appearance' | 'navigator' | 'search';

/**
 * Рідер: завантажена на пристрій копія — без мережі, інакше текст із сервера.
 * Зміст і закладки, пошук, озвучення, «Aa»; довге натискання на абзац — дії з ним.
 */
export function ReaderScreen({ bookId }: { bookId: string }) {
  const t = useT();
  const book = useCatalogBook(bookId);
  const downloaded = useDownload(bookId);
  const content = useAsync(
    `content:${bookId}`,
    async () => (await readDownloadedContent(bookId)) ?? catalogApi.getContent(bookId),
  );
  // Без мережі назва береться із завантаженої копії
  const meta = book.status === 'ready' ? book.value : (downloaded?.book ?? null);

  return (
    <>
      <Stack.Screen options={{ title: meta?.title ?? '' }} />
      {content.status === 'loading' ? (
        <Loader />
      ) : content.status === 'error' ? (
        <CenteredMessage title={t.reader.openError} />
      ) : content.value.paragraphs.length === 0 ? (
        <CenteredMessage
          title={t.reader.openError}
          description={meta?.format === 'pdf' ? t.reader.pdfUnavailable : undefined}
        />
      ) : (
        <Reader
          content={content.value}
          title={meta?.title ?? ''}
          language={meta?.language ?? 'uk'}
        />
      )}
    </>
  );
}

interface ReaderProps {
  content: BookContent;
  title: string;
  language: 'uk' | 'en';
}

function Reader({ content, title, language }: ReaderProps) {
  const t = useT();
  const { bookId, paragraphs, chapters } = content;
  const saved = useReadingPosition(bookId);
  const bookmarks = useBookBookmarks(bookId);
  const toggleBookmark = useBookmarksStore((s) => s.toggle);
  const markFinished = useReadingStatsStore((s) => s.markFinished);
  const share = useShare();
  const listRef = useRef<FlashListRef<string>>(null);
  const [fraction, setFraction] = useState<number | null>(null);
  const [paragraph, setParagraph] = useState(saved?.paragraph ?? 0);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useReadingTime(true);

  const goTo = (index: number) => {
    setPanel(null);
    runInBackground(async () => listRef.current?.scrollToIndex({ index, animated: true }));
  };

  const readAloud = useReadAloud({
    paragraphs,
    language,
    onParagraph: goTo,
    onError: () => notify.error(t.reader.listenUnavailable),
  });
  const bookmarked = new Set(bookmarks.map((bookmark) => bookmark.paragraph));
  const percent = Math.round(Math.min(1, Math.max(0, fraction ?? saved?.fraction ?? 0)) * 100);

  const handleProgress = (value: number, first: number) => {
    setFraction(value);
    setParagraph(first);

    if (value >= FINISHED_FRACTION) {
      markFinished(bookId);
    }
  };

  const closeSelected = () => setSelected(null);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerRight}>
              <Text variant="mono">{`${percent}%`}</Text>
              <IconButton
                icon="list"
                accessibilityLabel={`${t.reader.contents} / ${t.reader.bookmarks}`}
                onPress={() => setPanel('navigator')}
              />
              <IconButton
                icon="search"
                accessibilityLabel={t.reader.search}
                onPress={() => setPanel('search')}
              />
              <IconButton
                icon={readAloud.isSpeaking ? 'pause' : 'headphones'}
                accessibilityLabel={readAloud.isSpeaking ? t.reader.stopListening : t.reader.listen}
                onPress={() =>
                  readAloud.isSpeaking ? readAloud.stop() : readAloud.start(paragraph)
                }
              />
              <IconButton
                icon="type"
                accessibilityLabel={t.reader.appearance}
                onPress={() => setPanel('appearance')}
              />
            </View>
          ),
        }}
      />

      <TextReader
        content={content}
        listRef={listRef}
        bookmarked={bookmarked}
        activeParagraph={readAloud.current}
        onProgress={handleProgress}
        onLongPressParagraph={setSelected}
      />

      {readAloud.isSpeaking ? (
        <ListenBar
          rate={readAloud.rate}
          onRateChange={readAloud.changeRate}
          onStop={readAloud.stop}
        />
      ) : null}

      <AppearancePanel visible={panel === 'appearance'} onClose={() => setPanel(null)} />
      <NavigatorPanel
        visible={panel === 'navigator'}
        chapters={chapters}
        bookmarks={bookmarks}
        currentParagraph={paragraph}
        onSelect={goTo}
        onClose={() => setPanel(null)}
      />
      <SearchPanel
        visible={panel === 'search'}
        paragraphs={paragraphs}
        onSelect={goTo}
        onClose={() => setPanel(null)}
      />
      <ParagraphSheet
        text={selected === null ? null : (paragraphs[selected] ?? null)}
        isBookmarked={selected !== null && bookmarked.has(selected)}
        onToggleBookmark={() => {
          if (selected !== null && toggleBookmark(bookId, selected, paragraphs[selected] ?? '')) {
            notify.success(t.reader.bookmarkAdded);
          }

          closeSelected();
        }}
        onShare={() => {
          if (selected !== null) {
            void share({
              message: `«${toQuote(paragraphs[selected] ?? '')}»\n— ${t.share.quote(title)}`,
              path: `/book/${bookId}`,
            });
          }

          closeSelected();
        }}
        onListen={() => {
          if (selected !== null) {
            readAloud.start(selected);
          }

          closeSelected();
        }}
        onClose={closeSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
