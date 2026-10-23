import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BookContent } from '@/features/catalog';
import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Text } from '@/shared/ui';

interface ContentsPanelProps {
  visible: boolean;
  chapters: BookContent['chapters'];
  /** Перший видимий абзац — щоб підсвітити поточний розділ */
  currentParagraph: number;
  onSelect: (paragraph: number) => void;
  onClose: () => void;
}

/** Зміст книги: тап по розділу — перехід до нього. */
export function ContentsPanel({
  visible,
  chapters,
  currentParagraph,
  onSelect,
  onClose,
}: ContentsPanelProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  // Поточний — останній розділ, що почався до видимого абзацу
  const currentIndex = chapters.reduce(
    (found, chapter, index) => (chapter.paragraph <= currentParagraph ? index : found),
    -1,
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t.common.close} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Text variant="screenTitle" style={styles.title}>
          {t.reader.contents}
        </Text>
        <FlatList
          data={chapters}
          keyExtractor={(chapter) => `${chapter.paragraph}`}
          renderItem={({ item, index }) => (
            <Pressable
              accessibilityRole="button"
              onPress={() => onSelect(item.paragraph)}
              style={({ pressed }) => [
                styles.row,
                index === currentIndex && styles.current,
                pressed && styles.pressed,
              ]}>
              <Text variant="label" color={index === currentIndex ? 'primaryLight' : 'text'}>
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '70%',
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    paddingTop: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  row: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  current: { backgroundColor: colors.input },
  pressed: { opacity: 0.7 },
});
