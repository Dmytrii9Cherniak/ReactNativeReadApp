import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookGrid, type CatalogBook } from '@/features/catalog';
import { errorText, useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';
import { CenteredMessage, Loader, UnderlineTabs } from '@/shared/ui';

import { getShelfLabel } from './lib/shelf-labels';
import { useShelvesStore } from './shelves.store';

import type { Shelf } from './types';

/** Порядок вкладок — як у макеті. */
const TABS: readonly Shelf[] = ['reading', 'want', 'read'];

export function MyBooksScreen() {
  const t = useT();
  const entries = useShelvesStore((s) => s.entries);
  const isLoaded = useShelvesStore((s) => s.isLoaded);
  const load = useShelvesStore((s) => s.load);
  const [activeShelf, setActiveShelf] = useState<Shelf>('reading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load().catch((caught: unknown) => setError(errorText(t, caught)));
  }, [load, t]);

  if (!isLoaded) {
    return error ? <CenteredMessage title={t.common.loadError} description={error} /> : <Loader />;
  }

  // Нещодавно змінені — першими
  const books = Object.values(entries)
    .filter((entry) => entry.shelf === activeShelf)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((entry) => entry.book);

  const openBook = (book: CatalogBook) => {
    router.push({ pathname: '/book/[id]', params: { id: book.id } });
  };

  return (
    <View style={styles.container}>
      <UnderlineTabs
        tabs={TABS}
        active={activeShelf}
        onChange={setActiveShelf}
        getLabel={(shelf) => getShelfLabel(t, shelf)}
      />
      <BookGrid
        books={books}
        onPressBook={openBook}
        showAuthor={false}
        ListHeaderComponent={<View style={styles.gridTop} />}
        ListEmptyComponent={<CenteredMessage title={t.myBooks.empty} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gridTop: { height: spacing.lg },
});
