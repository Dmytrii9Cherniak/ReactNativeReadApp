import { useState } from 'react';

import type { CatalogBook } from '@/features/catalog';
import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { Button } from '@/shared/ui';

import { useDownload, useDownloadsStore } from '../downloads.store';

/** «Завантажити для читання без мережі» / «Видалити з пристрою». */
export function DownloadButton({ book }: { book: CatalogBook }) {
  const t = useT();
  const downloaded = useDownload(book.id);
  const download = useDownloadsStore((s) => s.download);
  const remove = useDownloadsStore((s) => s.remove);
  const [isBusy, setIsBusy] = useState(false);

  // PDF поки читати не можна — і завантажувати нема чого
  if (book.format === 'pdf') {
    return null;
  }

  const run = async (task: () => Promise<void>, success: string) => {
    setIsBusy(true);

    try {
      await task();
      notify.success(success);
    } catch (error) {
      notify.error(errorText(t, error));
    } finally {
      setIsBusy(false);
    }
  };

  return downloaded ? (
    <Button
      variant="outline"
      icon="check-circle"
      title={`${t.downloads.downloaded} · ${t.downloads.remove}`}
      loading={isBusy}
      onPress={() => void run(() => remove(book.id), t.downloads.removed)}
    />
  ) : (
    <Button
      variant="outline"
      icon="download"
      title={t.downloads.download}
      loading={isBusy}
      onPress={() => void run(() => download(book), t.downloads.saved)}
    />
  );
}
