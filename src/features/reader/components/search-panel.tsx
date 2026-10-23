import { useDeferredValue, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';
import { BottomSheet, Text, TextField } from '@/shared/ui';

import { searchParagraphs } from '../lib/search';

interface SearchPanelProps {
  visible: boolean;
  paragraphs: string[];
  onSelect: (paragraph: number) => void;
  onClose: () => void;
}

/** Пошук у тексті книги: список збігів з уривком, тап — перехід. */
export function SearchPanel({ visible, paragraphs, onSelect, onClose }: SearchPanelProps) {
  const t = useT();
  const [query, setQuery] = useState('');
  // Пошук по великій книзі не гальмує набір: рахується після літери, а не під час
  const deferredQuery = useDeferredValue(query);
  const hits = searchParagraphs(paragraphs, deferredQuery);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={t.reader.search}>
      <View style={styles.field}>
        <TextField
          value={query}
          onChangeText={setQuery}
          placeholder={t.reader.searchPlaceholder}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
        {deferredQuery.trim().length >= 2 ? (
          <Text variant="caption">
            {hits.length > 0 ? t.reader.searchResults(hits.length) : t.reader.searchNone}
          </Text>
        ) : null}
      </View>
      <FlatList
        data={hits}
        keyExtractor={(hit) => `${hit.paragraph}`}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => onSelect(item.paragraph)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Text variant="caption" color="textSecondary">
              {item.before}
              <Text variant="caption" color="primaryLight" style={styles.match}>
                {item.match}
              </Text>
              {item.after}
            </Text>
          </Pressable>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  row: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  match: { fontWeight: '700', backgroundColor: colors.primaryActive },
  pressed: { opacity: 0.7 },
});
