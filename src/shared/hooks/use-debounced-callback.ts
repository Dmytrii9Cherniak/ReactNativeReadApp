import { useCallback, useEffect, useRef } from 'react';

/**
 * Відкладений виклик: `callback` спрацьовує через `delay` мс після ОСТАННЬОГО виклику.
 * При unmount відкладений виклик виконується одразу — останнє значення не губиться.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
): (...args: Args) => void {
  const callbackRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pendingArgsRef = useRef<Args | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);

      if (pendingArgsRef.current) {
        callbackRef.current(...pendingArgsRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      pendingArgsRef.current = args;
      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        pendingArgsRef.current = null;
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
