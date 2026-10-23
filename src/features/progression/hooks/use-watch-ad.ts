import { useState } from 'react';

import { errorText, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';

import { useProgressionStore } from '../progression.store';

/** «Переглянути рекламу»: +1…5 XP, до 3 разів на день (ліміт перевіряє сервер). */
export function useWatchAd() {
  const t = useT();
  const watchAd = useProgressionStore((s) => s.watchAd);
  const [isWatching, setIsWatching] = useState(false);

  const watch = async () => {
    setIsWatching(true);

    try {
      // Справжній ролик покаже рекламний SDK; тут — одразу нагорода
      notify.success(t.progression.adReward(await watchAd()));
    } catch (error) {
      notify.error(errorText(t, error));
    } finally {
      setIsWatching(false);
    }
  };

  return { watch, isWatching };
}
