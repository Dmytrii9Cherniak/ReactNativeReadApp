import { FlashList, type FlashListRef, type ViewToken } from '@shopify/flash-list';
import { useState, type Ref } from 'react';
import { StyleSheet } from 'react-native';

import type { BookContent } from '@/features/catalog';
import { useReadingStyle } from '@/features/settings';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { colors, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { useReadingProgressStore } from '../reading-progress.store';

/** Позиція зберігається, коли прокрутка «вляглася», а не на кожен кадр. */
const SAVE_PROGRESS_DELAY_MS = 500;

interface TextReaderProps {
  content: BookContent;
  /** Частка прочитаного й перший видимий абзац (для «Змісту») */
  onProgress: (fraction: number, paragraph: number) => void;
  /** Для переходу до розділу: listRef.current?.scrollToIndex(...) */
  listRef?: Ref<FlashListRef<string>>;
}

/**
 * Текст — віртуалізований список абзаців: на екрані лише видимі, тож довгі книги не гальмують.
 * Шрифт і розмір — з налаштувань, змінюються «на льоту».
 */
export function TextReader({ content, onProgress, listRef }: TextReaderProps) {
  const { bookId, paragraphs, chapters } = content;
  // Початки розділів показуємо заголовками
  const [headings] = useState(() => new Set(chapters.map((chapter) => chapter.paragraph)));
  const save = useReadingProgressStore((s) => s.save);
  const readingStyle = useReadingStyle();
  // Початкова позиція читається один раз: далі список керує прокруткою сам
  const [initialParagraph] = useState(() => {
    const saved = useReadingProgressStore.getState().positions[bookId]?.paragraph;

    // Книга могла змінитись (стала коротшою) — позиція має бути в межах тексту
    if (saved === undefined || paragraphs.length === 0) {
      return undefined;
    }

    return Math.min(Math.max(0, saved), paragraphs.length - 1);
  });

  const savePosition = useDebouncedCallback((first: number, fraction: number) => {
    save(bookId, { paragraph: first, fraction });
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

    const fraction = (Math.max(...indexes) + 1) / paragraphs.length;

    onProgress(fraction, Math.min(...indexes));
    savePosition(Math.min(...indexes), fraction);
  };

  return (
    <FlashList
      ref={listRef}
      data={paragraphs}
      keyExtractor={(_, index) => String(index)}
      extraData={readingStyle}
      renderItem={({ item, index }) => (
        <Text
          variant="reading"
          style={[readingStyle, styles.paragraph, headings.has(index) && styles.heading]}>
          {item}
        </Text>
      )}
      initialScrollIndex={initialParagraph}
      onViewableItemsChanged={handleViewableItemsChanged}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  heading: { marginTop: spacing.xl, fontWeight: '700', color: colors.primaryLight },
  paragraph: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
});
