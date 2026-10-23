import { StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { spacing } from '@/shared/theme';
import { BottomSheet, Button, Text } from '@/shared/ui';

interface ParagraphSheetProps {
  /** Обраний абзац; null — панель закрита */
  text: string | null;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onShare: () => void;
  onListen: () => void;
  onClose: () => void;
}

/** Дії з абзацом (довге натискання): закладка, поділитися цитатою, слухати звідси. */
export function ParagraphSheet({
  text,
  isBookmarked,
  onToggleBookmark,
  onShare,
  onListen,
  onClose,
}: ParagraphSheetProps) {
  const t = useT();

  return (
    <BottomSheet visible={text !== null} onClose={onClose}>
      <View style={styles.content}>
        <Text variant="caption" color="textSecondary" numberOfLines={4}>
          {text}
        </Text>
        <Button
          variant="outline"
          icon="bookmark"
          title={isBookmarked ? t.reader.removeBookmark : t.reader.addBookmark}
          onPress={onToggleBookmark}
        />
        <Button variant="outline" icon="share-2" title={t.reader.shareQuote} onPress={onShare} />
        <Button variant="outline" icon="headphones" title={t.reader.listen} onPress={onListen} />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.sm, paddingHorizontal: spacing.xl },
});
