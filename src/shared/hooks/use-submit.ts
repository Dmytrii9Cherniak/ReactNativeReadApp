import { useState } from 'react';

import { errorText, useT } from '@/shared/i18n';

/**
 * Стан відправки форми чи дії: `isSubmitting` і перекладений текст помилки.
 * `setError` — для помилок перевірки полів до запиту.
 */
export function useSubmit<Args extends unknown[]>(action: (...args: Args) => Promise<void>) {
  const t = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (...args: Args) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await action(...args);
    } catch (caught) {
      setError(errorText(t, caught));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, error, setError };
}
