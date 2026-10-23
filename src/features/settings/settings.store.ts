import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from '@/shared/lib/persist';
import type { ReaderPaletteId } from '@/shared/theme';

import { TEXT_SIZE } from './lib/text-size';

import type { ReaderAlign, ReaderMargin } from './lib/reader-layout';
import type { ReadingFontId } from './lib/reading-fonts';

interface SettingsState {
  readerFont: ReadingFontId;
  readerFontSize: number;
  readerTheme: ReaderPaletteId;
  readerMargin: ReaderMargin;
  readerAlign: ReaderAlign;
  /** Яскравість екрана застосунку 0…1; null — системна (ще не змінювали) */
  brightness: number | null;
  setReaderFont: (font: ReadingFontId) => void;
  setReaderFontSize: (size: number) => void;
  setReaderTheme: (theme: ReaderPaletteId) => void;
  setReaderMargin: (margin: ReaderMargin) => void;
  setReaderAlign: (align: ReaderAlign) => void;
  setBrightness: (brightness: number) => void;
}

/** Налаштування читання. Зберігаються на пристрої, не на сервері. */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readerFont: 'literata',
      readerFontSize: TEXT_SIZE.default,
      readerTheme: 'zone',
      readerMargin: 'normal',
      readerAlign: 'left',
      brightness: null,
      setReaderFont: (readerFont) => set({ readerFont }),
      setReaderFontSize: (readerFontSize) => set({ readerFontSize }),
      setReaderTheme: (readerTheme) => set({ readerTheme }),
      setReaderMargin: (readerMargin) => set({ readerMargin }),
      setReaderAlign: (readerAlign) => set({ readerAlign }),
      setBrightness: (brightness) => set({ brightness }),
    }),
    { name: 'settings', storage: persistStorage },
  ),
);
