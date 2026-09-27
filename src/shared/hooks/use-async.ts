import { useEffect, useEffectEvent, useState } from 'react';

import { getErrorMessage } from '@/shared/lib/errors';

export type AsyncState<T> =
  { status: 'loading' } | { status: 'ready'; value: T } | { status: 'error'; message: string };

type SettledState<T> = Exclude<AsyncState<T>, { status: 'loading' }>;

/**
 * Завантажує значення для `key` і перезавантажує при його зміні.
 *
 * - Результат прив'язаний до `key`: поки для поточного ключа його немає — 'loading'.
 * - Відповіді для застарілого ключа ігноруються.
 * - `dispose` викликається для значення, яке більше не потрібне (зміна ключа / unmount).
 */
export function useAsync<T>(
  key: string,
  load: () => Promise<T>,
  dispose?: (value: T) => void,
): AsyncState<T> {
  const [result, setResult] = useState<{ key: string; state: SettledState<T> } | null>(null);
  const onLoad = useEffectEvent(load);
  const onDispose = useEffectEvent((value: T) => dispose?.(value));

  useEffect(() => {
    let active = true;
    let loaded: { value: T } | null = null;

    onLoad()
      .then((value) => {
        if (!active) {
          onDispose(value);

          return;
        }

        loaded = { value };
        setResult({ key, state: { status: 'ready', value } });
      })
      .catch((error: unknown) => {
        if (active) {
          setResult({ key, state: { status: 'error', message: getErrorMessage(error) } });
        }
      });

    return () => {
      active = false;

      if (loaded) {
        onDispose(loaded.value);
      }
    };
  }, [key]);

  if (result?.key !== key) {
    return { status: 'loading' };
  }

  return result.state;
}
