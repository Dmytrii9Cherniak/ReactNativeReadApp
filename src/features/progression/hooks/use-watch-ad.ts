import { useState } from 'react';

import { errorText, useT } from '@/shared/i18n';
import { showMessage } from '@/shared/lib/dialogs';

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
      showMessage(t.progression.adReward(await watchAd()));
    } catch (error) {
      showMessage(t.common.error, errorText(t, error));
    } finally {
      setIsWatching(false);
    }
  };

  return { watch, isWatching };
}
