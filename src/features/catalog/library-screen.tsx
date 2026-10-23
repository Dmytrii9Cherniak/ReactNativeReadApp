import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';
import { CenteredMessage, Loader, Text, TextField } from '@/shared/ui';

import { BookGrid } from './components/book-grid';
import { useLibraryBooks } from './hooks/use-catalog';

import type { CatalogBook } from './types';
import type { ReactElement } from 'react';

/** Запит іде, коли користувач перестав друкувати. */
const SEARCH_DELAY_MS = 300;

/**
 * Макет, екран 1 + пошук. Бібліотеку бачать і гості.
 * `header` — блок над сіткою (у застосунку — «Продовжити читання» з фічі reader).
 */
export function LibraryScreen({ header }: { header?: ReactElement }) {
  const t = useT();
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const applySearch = useDebouncedCallback(setSearch, SEARCH_DELAY_MS);
  const state = useLibraryBooks(search);

  const handleChange = (text: string) => {
    setInput(text);
    applySearch(text);
  };

  const openBook = (book: CatalogBook) => {
    router.push({ pathname: '/book/[id]', params: { id: book.id } });
  };

  return (
    <View style={styles.container}>
      <View style={styles.search}>
        <TextField
          value={input}
          onChangeText={handleChange}
          placeholder={t.library.search}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      {state.status === 'loading' ? (
        <Loader />
      ) : state.status === 'error' ? (
        <CenteredMessage title={t.common.loadError} description={state.message} />
      ) : (
        <BookGrid
          books={state.value.items}
          onPressBook={openBook}
          ListHeaderComponent={
            <View>
              {search ? null : header}
              <Text variant="sectionLabel" style={styles.label}>
                {t.library.count(state.value.total)}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <CenteredMessage title={search ? t.library.notFound : t.library.empty} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  label: { paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
});
