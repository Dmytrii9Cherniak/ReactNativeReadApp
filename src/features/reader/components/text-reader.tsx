import { FlashList, type FlashListRef, type ViewToken } from '@shopify/flash-list';
import { useState, type Ref } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import type { BookContent } from '@/features/catalog';
import { useReaderLook, useReadingStyle } from '@/features/settings';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

import { useReadingProgressStore } from '../reading-progress.store';

/** Позиція зберігається, коли прокрутка «вляглася», а не на кожен кадр. */
const SAVE_PROGRESS_DELAY_MS = 500;
const LONG_PRESS_MS = 450;

interface TextReaderProps {
  content: BookContent;
  /** Частка прочитаного й перший видимий абзац (для «Змісту») */
  onProgress: (fraction: number, paragraph: number) => void;
  /** Довге натискання на абзац — дії з ним (закладка, цитата, слухати) */
  onLongPressParagraph: (paragraph: number) => void;
  /** Абзаци із закладками — позначені смужкою зліва */
  bookmarked: ReadonlySet<number>;
  /** Абзац, який зараз озвучується, — підсвічений */
  activeParagraph: number | null;
  /** Для переходу до місця: listRef.current?.scrollToIndex(...) */
  listRef?: Ref<FlashListRef<string>>;
}

/**
 * Текст — віртуалізований список абзаців: на екрані лише видимі, тож довгі книги не гальмують.
 * Шрифт, розмір, тема, поля й вирівнювання — з налаштувань, змінюються «на льоту».
 */
export function TextReader({
  content,
  onProgress,
  onLongPressParagraph,
  bookmarked,
  activeParagraph,
  listRef,
}: TextReaderProps) {
  const { bookId, paragraphs, chapters } = content;
  // Початки розділів показуємо заголовками
  const [headings] = useState(() => new Set(chapters.map((chapter) => chapter.paragraph)));
  const save = useReadingProgressStore((s) => s.save);
  const readingStyle = useReadingStyle();
  const { palette, paddingHorizontal, textAlign } = useReaderLook();
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
      extraData={{
        readingStyle,
        palette,
        paddingHorizontal,
        textAlign,
        bookmarked,
        activeParagraph,
      }}
      renderItem={({ item, index }) => (
        // Pressable, а не onLongPress у Text: у браузері Text довге натискання не підтримує
        <Pressable onLongPress={() => onLongPressParagraph(index)} delayLongPress={LONG_PRESS_MS}>
          <Text
            variant="reading"
            style={[
              readingStyle,
              styles.paragraph,
              { color: palette.text, textAlign },
              headings.has(index) && [styles.heading, { color: palette.heading }],
              bookmarked.has(index) && [styles.bookmarked, { borderLeftColor: palette.heading }],
              index === activeParagraph && styles.active,
            ]}>
            {item}
          </Text>
        </Pressable>
      )}
      initialScrollIndex={initialParagraph}
      onViewableItemsChanged={handleViewableItemsChanged}
      // FlashList приймає лише об'єкт стилю, не масив
      style={{ ...styles.list, backgroundColor: palette.background }}
      contentContainerStyle={[styles.content, { paddingHorizontal }]}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingVertical: spacing.lg },
  heading: { marginTop: spacing.xl, fontWeight: '700' },
  paragraph: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  bookmarked: { paddingLeft: spacing.sm, borderLeftWidth: borderWidth.accent },
  active: { borderRadius: radius.sm, backgroundColor: colors.primaryActive },
});
