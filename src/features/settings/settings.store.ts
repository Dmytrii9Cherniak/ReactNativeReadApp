import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';

import { TEXT_SIZE } from './lib/text-size';

import type { ReadingFontId } from './lib/reading-fonts';

interface SettingsState {
  readerFont: ReadingFontId;
  readerFontSize: number;
  /** Яскравість екрана застосунку 0…1; null — системна (ще не змінювали) */
  brightness: number | null;
  setReaderFont: (font: ReadingFontId) => void;
  setReaderFontSize: (size: number) => void;
  setBrightness: (brightness: number) => void;
}

/** Налаштування читання. Зберігаються на пристрої, не на сервері. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readerFont: 'literata',
      readerFontSize: TEXT_SIZE.default,
      brightness: null,
      setReaderFont: (readerFont) => set({ readerFont }),
      setReaderFontSize: (readerFontSize) => set({ readerFontSize }),
      setBrightness: (brightness) => set({ brightness }),
    }),
    { name: 'settings', storage: persistStorage },
  ),
);
