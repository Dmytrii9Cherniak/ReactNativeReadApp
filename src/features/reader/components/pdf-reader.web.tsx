import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useEffect, useEffectEvent, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Document, Page, pdfjs } from 'react-pdf';

import { MAX_CONTENT_WIDTH } from '@/shared/constants/layout';
import { getErrorMessage } from '@/shared/lib/errors';
import { borderWidth, colors, spacing } from '@/shared/theme';
import { Button, CenteredMessage, Loader } from '@/shared/ui';

import type { PdfReaderProps } from './pdf-reader.types';

/** Воркер pdf.js копіюється в public/ скриптом scripts/copy-pdf-worker.js (postinstall). */
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

/** Web: pdf.js через react-pdf. Посторінковий перегляд, стрілки ← → на клавіатурі. */
export function PdfReader({ uri, initialPage, onPageChange }: PdfReaderProps) {
  const [page, setPage] = useState(initialPage);
  const [pageCount, setPageCount] = useState(0);
  const [width, setWidth] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const goTo = (next: number) => {
    if (pageCount === 0) {
      return;
    }

    const clamped = Math.min(Math.max(next, 1), pageCount);

    setPage(clamped);
    onPageChange(clamped, pageCount);
  };

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      goTo(page + 1);
    }

    if (event.key === 'ArrowLeft') {
      goTo(page - 1);
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event);

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, []);

  if (error) {
    return <CenteredMessage title="Не вдалося відкрити PDF" description={error} />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        onLayout={(e) => setWidth(Math.min(e.nativeEvent.layout.width, MAX_CONTENT_WIDTH))}>
        <Document
          file={uri}
          loading={<Loader />}
          onLoadSuccess={({ numPages }) => {
            const start = Math.min(initialPage, numPages);

            setPageCount(numPages);
            setPage(start);
            onPageChange(start, numPages);
          }}
          onLoadError={(e) => setError(getErrorMessage(e))}>
          {width > 0 ? <Page pageNumber={page} width={width - spacing.xl * 2} /> : null}
        </Document>
      </ScrollView>

      <View style={styles.toolbar}>
        <Button
          title="‹ Назад"
          variant="outline"
          disabled={page <= 1}
          onPress={() => goTo(page - 1)}
        />
        <Button
          title="Далі ›"
          variant="outline"
          disabled={page >= pageCount}
          onPress={() => goTo(page + 1)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { alignItems: 'center', padding: spacing.xl },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderTopWidth: borderWidth.hairline,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
