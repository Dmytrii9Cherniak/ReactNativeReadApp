import { FlashList, type ViewToken } from '@shopify/flash-list';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useLibraryStore, type Book } from '@/features/library';
import { charsToPages } from '@/features/stats';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { colors, spacing, typography } from '@/shared/theme';
import { CenteredMessage, Loader, Text } from '@/shared/ui';

import { useBookText } from '../hooks/use-book-text';
import { useReadPagesTracker } from '../hooks/use-read-pages-tracker';
import { lineEndOffsets, splitLines } from '../lib/text-lines';

/** Позиція зберігається, коли прокрутка «вляглася», а не на кожну зміну видимих рядків. */
const SAVE_PROGRESS_DELAY_MS = 500;

export function TextReader({ book }: { book: Book }) {
  const state = useBookText(book);

  if (state.status === 'loading') {
    return <Loader />;
  }

  if (state.status === 'error') {
    return <CenteredMessage title="Не вдалося прочитати файл" description={state.message} />;
  }

  return <TextContent book={book} text={state.value} />;
}

/**
 * Текст рендериться віртуалізованим списком рядків: на екрані лише видимі,
 * тож великі файли не гальмують. Позиція — індекс першого видимого рядка.
 */
function TextContent({ book, text }: { book: Book; text: string }) {
  const saveProgress = useLibraryStore((s) => s.saveProgress);
  const trackReadPages = useReadPagesTracker(book);
  const [lines] = useState(() => splitLines(text));
  const [lineEnds] = useState(() => lineEndOffsets(lines));
  const [initialLine] = useState(() => getSavedLine(book, lines.length));

  /** Позиція — перший видимий рядок; прочитане — усе до останнього видимого. */
  const savePosition = useDebouncedCallback((firstVisible: number, lastVisible: number) => {
    void saveProgress(book.id, {
      location: { type: 'line', line: firstVisible },
      fraction: (lastVisible + 1) / lines.length,
      furthestPages: trackReadPages(charsToPages(lineEnds[lastVisible])),
    });
  }, SAVE_PROGRESS_DELAY_MS);

  const handleViewableItemsChanged = ({
    viewableItems,
  }: {
    viewableItems: ViewToken<string>[];
  }) => {
    const indexes = viewableItems.flatMap((token) => (token.index === null ? [] : [token.index]));

    if (indexes.length === 0) {
      return;
    }

    savePosition(Math.min(...indexes), Math.max(...indexes));
  };

  return (
    <FlashList
      data={lines}
      keyExtractor={(_, index) => String(index)}
      renderItem={({ item }) => <Line text={item} />}
      initialScrollIndex={initialLine}
      onViewableItemsChanged={handleViewableItemsChanged}
      style={styles.container}
      contentContainerStyle={styles.content}
    />
  );
}

/** Порожній рядок файлу — відступ висотою в рядок, як у самому файлі. */
function Line({ text }: { text: string }) {
  if (text.length === 0) {
    return <View style={styles.blankLine} />;
  }

  return <Text variant="reading">{text}</Text>;
}

/** Збережений рядок, якщо прогрес книги записаний у рядках. */
function getSavedLine(book: Book, lineCount: number): number | undefined {
  const location = book.progress?.location;

  if (location?.type !== 'line') {
    return undefined;
  }

  return Math.min(location.line, lineCount - 1);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  blankLine: { height: typography.reading.lineHeight },
});
