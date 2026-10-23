import { useState } from 'react';

import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';

/**
 * Дія адміна (схвалити, заблокувати…): показує результат сповіщенням,
 * а після успіху викликає `onDone` (оновити список, повернутися назад).
 */
export function useAdminAction(onDone?: () => void) {
  const t = useT();
  const [isRunning, setIsRunning] = useState(false);

  const run = async (task: () => Promise<unknown>, successText: string): Promise<boolean> => {
    setIsRunning(true);

    try {
      await task();
      notify.success(successText);
      onDone?.();

      return true;
    } catch (error) {
      notify.error(errorText(t, error));

      return false;
    } finally {
      setIsRunning(false);
    }
  };

  return { run, isRunning };
}
