import { useEffect, useState } from 'react';

import { libraryStorage, type Book } from '@/features/library';

type BookTextState =
  | { status: 'loading' }
  | { status: 'ready'; text: string }
  | { status: 'error'; message: string };

export function useBookText(book: Book): BookTextState {
  const [state, setState] = useState<BookTextState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });

    libraryStorage
      .readBookText(book.fileName)
      .then((text) => !cancelled && setState({ status: 'ready', text }))
      .catch((e: unknown) => {
        if (!cancelled) {
          setState({ status: 'error', message: e instanceof Error ? e.message : String(e) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [book.fileName]);

  return state;
}
