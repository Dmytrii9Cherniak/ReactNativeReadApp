import { useEffect, useState } from 'react';

import { libraryStorage, type Book } from '@/features/library';

type BookTextState =
  { status: 'loading' } | { status: 'ready'; text: string } | { status: 'error'; message: string };

type LoadedResult = Exclude<BookTextState, { status: 'loading' }>;

/**
 * Читає текст книги.
 * Результат прив'язаний до fileName: поки для поточного файлу результату немає — 'loading'.
 * Так не потрібно синхронно скидати стан в ефекті при зміні книги.
 */
export function useBookText(book: Book): BookTextState {
  const { fileName } = book;
  const [result, setResult] = useState<{ fileName: string; value: LoadedResult } | null>(null);

  useEffect(() => {
    let cancelled = false;

    libraryStorage
      .readBookText(fileName)
      .then((text) => {
        if (!cancelled) {
          setResult({ fileName, value: { status: 'ready', text } });
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : String(e);
          setResult({ fileName, value: { status: 'error', message } });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fileName]);

  if (result?.fileName !== fileName) {
    return { status: 'loading' };
  }

  return result.value;
}
