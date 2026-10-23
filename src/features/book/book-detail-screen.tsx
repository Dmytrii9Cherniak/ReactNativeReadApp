import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useCan } from '@/features/auth';
import { BookCover, useCatalogBook } from '@/features/catalog';
import { useReadingPosition } from '@/features/reader';
import { ShelfPicker } from '@/features/shelves';
import { useT } from '@/shared/i18n';
import { colors, spacing } from '@/shared/theme';
import { Button, CenteredMessage, Loader, Text } from '@/shared/ui';

/** Ширина колонки контенту: на планшеті сторінка книги не розтягується на весь екран. */
const CONTENT_MAX_WIDTH = 560;
const COVER_WIDTH = 124;

export function BookDetailScreen({ bookId }: { bookId: string }) {
  const t = useT();
  const state = useCatalogBook(bookId);
  const canShelve = useCan('shelves');
  const position = useReadingPosition(bookId);

  if (state.status === 'loading') {
    return <Loader />;
  }

  if (state.status === 'error') {
    return <CenteredMessage title={t.book.notFound} />;
  }

  const book = state.value;

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.column}>
          <View style={styles.hero}>
            <BookCover book={book} width={COVER_WIDTH} />
            <Text variant="display" style={styles.center}>
              {book.title}
            </Text>
            <Text variant="body" color="textSecondary">
              {book.author}
            </Text>
            <Text variant="caption" color="textFaint">
              {`${t.book.readCount(book.readCount)} · ${t.languages[book.language]}`}
            </Text>
          </View>

          <Text variant="body" color="text">
            {book.description}
          </Text>

          <View style={styles.section}>
            <Text variant="sectionLabel">{t.book.shelf}</Text>
            {canShelve ? (
              <ShelfPicker bookId={book.id} />
            ) : (
              <Button
                variant="outline"
                icon="log-in"
                title={t.book.loginToShelve}
                onPress={() => router.push('/login')}
              />
            )}
          </View>

          <Button
            title={
              position
                ? t.book.continueReading(Math.round(position.fraction * 100))
                : t.book.readNow
            }
            icon="book-open"
            onPress={() => router.push({ pathname: '/reader/[id]', params: { id: book.id } })}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  column: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center', marginTop: spacing.md },
  section: { gap: spacing.sm },
});
