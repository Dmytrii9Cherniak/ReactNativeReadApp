import { useState } from 'react';

import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';

const SEARCH_DELAY_MS = 300;

/** Поле пошуку: `input` — що в полі зараз, `search` — що піде в запит (коли перестали друкувати). */
export function useSearch() {
  const [input, setInputValue] = useState('');
  const [search, setSearch] = useState('');
  const applySearch = useDebouncedCallback(setSearch, SEARCH_DELAY_MS);

  const setInput = (value: string) => {
    setInputValue(value);
    applySearch(value);
  };

  return { input, search: search.trim(), setInput };
}
