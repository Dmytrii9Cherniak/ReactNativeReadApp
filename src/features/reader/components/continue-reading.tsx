import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { BookCover, useCatalogBook } from '@/features/catalog';
import { useT } from '@/shared/i18n';
import { borderWidth, colors, radius, spacing } from '@/shared/theme';
import { Icon, Text } from '@/shared/ui';

import { useReadingProgressStore } from '../reading-progress.store';

/** Дочитані книги в «Продовжити» не потрапляють. */
const FINISHED_FRACTION = 0.98;
const COVER_WIDTH = 48;

/** Картка «Продовжити читання»: остання відкрита недочитана книга. */
export function ContinueReading() {
  const positions = useReadingProgressStore((s) => s.positions);
  const [last] = Object.entries(positions)
    .filter(([, position]) => position.fraction < FINISHED_FRACTION)
    .sort(([, a], [, b]) => b.updatedAt.localeCompare(a.updatedAt));

  return last ? <ContinueCard bookId={last[0]} fraction={last[1].fraction} /> : null;
}

function ContinueCard({ bookId, fraction }: { bookId: string; fraction: number }) {
  const t = useT();
  const book = useCatalogBook(bookId);

  // Книгу прибрали з бібліотеки або ще вантажиться — нічого не показуємо
  if (book.status !== 'ready') {
    return null;
  }

  const percent = Math.round(fraction * 100);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/reader/[id]', params: { id: bookId } })}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <BookCover book={book.value} width={COVER_WIDTH} />
      <View style={styles.info}>
        <Text variant="sectionLabel" color="primaryLight">
          {t.library.continueReading}
        </Text>
        <Text variant="label" numberOfLines={1}>
          {book.value.title}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
        <Text variant="caption">{`${percent}%`}</Text>
      </View>
      <Icon name="chevron-right" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    backgroundColor: colors.surface,
  },
  info: { flex: 1, gap: spacing.xs },
  track: {
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.primaryLight },
  pressed: { opacity: 0.85 },
});
