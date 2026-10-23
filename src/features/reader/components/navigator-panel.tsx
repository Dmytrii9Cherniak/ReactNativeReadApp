import { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import type { BookContent } from '@/features/catalog';
import { useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';
import { BottomSheet, CenteredMessage, Text, UnderlineTabs } from '@/shared/ui';

import type { Bookmark } from '../bookmarks.store';

type Tab = 'contents' | 'bookmarks';

interface NavigatorPanelProps {
  visible: boolean;
  chapters: BookContent['chapters'];
  bookmarks: Bookmark[];
  /** Перший видимий абзац — щоб підсвітити поточний розділ */
  currentParagraph: number;
  onSelect: (paragraph: number) => void;
  onClose: () => void;
}

/** Зміст і закладки книги: тап — перехід до місця. */
export function NavigatorPanel({
  visible,
  chapters,
  bookmarks,
  currentParagraph,
  onSelect,
  onClose,
}: NavigatorPanelProps) {
  const t = useT();
  const [tab, setTab] = useState<Tab>(chapters.length > 0 ? 'contents' : 'bookmarks');
  // Поточний — останній розділ, що почався до видимого абзацу
  const currentChapter = chapters.reduce(
    (found, chapter, index) => (chapter.paragraph <= currentParagraph ? index : found),
    -1,
  );

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <UnderlineTabs
        tabs={['contents', 'bookmarks'] as const}
        active={tab}
        onChange={setTab}
        getLabel={(item) => (item === 'contents' ? t.reader.contents : t.reader.bookmarks)}
      />
      {tab === 'contents' ? (
        <FlatList
          data={chapters}
          keyExtractor={(chapter) => `${chapter.paragraph}`}
          renderItem={({ item, index }) => (
            <Row
              title={item.title}
              isCurrent={index === currentChapter}
              onPress={() => onSelect(item.paragraph)}
            />
          )}
        />
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(bookmark) => `${bookmark.paragraph}`}
          ListEmptyComponent={<CenteredMessage title={t.reader.noBookmarks} />}
          renderItem={({ item }) => (
            <Row
              title={item.excerpt}
              caption={`${t.reader.paragraph} ${item.paragraph + 1}`}
              onPress={() => onSelect(item.paragraph)}
            />
          )}
        />
      )}
    </BottomSheet>
  );
}

interface RowProps {
  title: string;
  caption?: string;
  isCurrent?: boolean;
  onPress: () => void;
}

function Row({ title, caption, isCurrent = false, onPress }: RowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, isCurrent && styles.current, pressed && styles.pressed]}>
      {caption ? <Text variant="caption">{caption}</Text> : null}
      <Text variant="label" color={isCurrent ? 'primaryLight' : 'text'} numberOfLines={3}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { gap: 2, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  current: { backgroundColor: colors.input },
  pressed: { opacity: 0.7 },
});
