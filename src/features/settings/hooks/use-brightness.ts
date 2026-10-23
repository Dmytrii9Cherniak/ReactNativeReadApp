import * as Brightness from 'expo-brightness';
import { useEffect, useState } from 'react';

import { useSettingsStore } from '../settings.store';

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

    void (async () => {
      const available = await Brightness.isAvailableAsync();
      const current = available ? await Brightness.getBrightnessAsync() : null;

      if (active) {
        setIsAvailable(available);

        if (current !== null) {
          setSystem(current);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const setBrightness = (value: number) => {
    save(value);
    void Brightness.setBrightnessAsync(value);
  };

  return { isAvailable, brightness: saved ?? system, setBrightness };
}

/** Кореневий layout: повернути збережену яскравість після запуску. */
export function useRestoreBrightness() {
  useEffect(() => {
    const apply = async () => {
      const { brightness } = useSettingsStore.getState();

      if (brightness !== null && (await Brightness.isAvailableAsync())) {
        await Brightness.setBrightnessAsync(brightness);
      }
    };

    // Налаштування читаються зі сховища асинхронно — чекаємо, поки завантажаться
    if (useSettingsStore.persist.hasHydrated()) {
      void apply();

      return undefined;
    }

    return useSettingsStore.persist.onFinishHydration(() => void apply());
  }, []);
}
