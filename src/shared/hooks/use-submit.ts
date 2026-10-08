import { useState } from 'react';

/**
 * Стан відправки форми: блокує повторне натискання, зберігає помилку.
 * Помилку повертає як є — форма сама вирішує, як її показати.
 */
export function useSubmit<Args extends unknown[]>(action: (...args: Args) => Promise<void>) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const submit = async (...args: Args) => {
    if (isSubmitting) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await action(...args);
    } catch (caught) {
      setError(caught);
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, isSubmitting, error };
}
