import * as Brightness from 'expo-brightness';
import { useEffect, useState } from 'react';

import { runInBackground } from '@/shared/lib/background';

import { useSettingsStore } from '../settings.store';

/** Чи можна змінювати яскравість: на web модуля немає, а на деяких пристроях він кидає помилку. */
async function isBrightnessAvailable(): Promise<boolean> {
  try {
    return await Brightness.isAvailableAsync();
  } catch {
    return false;
  }
}

/**
 * Яскравість екрана застосунку (iOS / Android). На web недоступна — `isAvailable: false`.
 * Значення зберігається й застосовується знову при наступному запуску.
 */
export function useBrightness() {
  const saved = useSettingsStore((s) => s.brightness);
  const save = useSettingsStore((s) => s.setBrightness);
  const [isAvailable, setIsAvailable] = useState(false);
  const [system, setSystem] = useState(0.5);

  useEffect(() => {
    let active = true;

    runInBackground(async () => {
      const available = await isBrightnessAvailable();

      if (!active) {
        return;
      }

      setIsAvailable(available);

      if (available) {
        const current = await Brightness.getBrightnessAsync();

        if (active) {
          setSystem(current);
        }
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const setBrightness = (value: number) => {
    save(value);
    runInBackground(() => Brightness.setBrightnessAsync(value));
  };

  return { isAvailable, brightness: saved ?? system, setBrightness };
}

/** Кореневий layout: повернути збережену яскравість після запуску. */
export function useRestoreBrightness() {
  useEffect(() => {
    const apply = () =>
      runInBackground(async () => {
        const { brightness } = useSettingsStore.getState();

        if (brightness !== null && (await isBrightnessAvailable())) {
          await Brightness.setBrightnessAsync(brightness);
        }
      });

    // Налаштування читаються зі сховища асинхронно — чекаємо, поки завантажаться
    if (useSettingsStore.persist.hasHydrated()) {
      apply();

      return undefined;
    }

    return useSettingsStore.persist.onFinishHydration(apply);
  }, []);
}
