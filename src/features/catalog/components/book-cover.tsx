import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { borderWidth, colors, radius } from '@/shared/theme';
import { Icon } from '@/shared/ui';

import { getCoverTone } from '../lib/cover-tone';

import type { CatalogBook } from '../types';

interface BookCoverProps {
  book: Pick<CatalogBook, 'id' | 'coverUrl'>;
  /** Ширина; висота — за пропорцією обкладинки 2:3. Без width — на всю ширину контейнера */
  width?: number;
}

/**
 * Обкладинка книги або кольорова заглушка з іконкою — і тоді, коли зображення немає,
 * і коли воно не завантажилось (немає мережі, посилання застаріло).
 */
export function BookCover({ book, width }: BookCoverProps) {
  const sizeStyle = width ? { width } : styles.fill;
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (book.coverUrl && book.coverUrl !== failedUrl) {
    const url = book.coverUrl;

    return (
      <Image
        source={{ uri: url }}
        onError={() => setFailedUrl(url)}
        resizeMode="cover"
        style={[styles.cover, sizeStyle]}
      />
    );
  }

  return (
    <View style={[styles.cover, sizeStyle, { backgroundColor: getCoverTone(book.id) }]}>
      <Icon name="book" size={20} color="textSecondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    aspectRatio: 2 / 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    borderWidth: borderWidth.hairline,
    borderColor: colors.borderActive,
    overflow: 'hidden',
  },
  fill: { width: '100%' },
});
