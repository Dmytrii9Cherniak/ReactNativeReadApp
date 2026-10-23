import { readerPalettes } from '@/shared/theme';

import { READER_MARGINS } from '../lib/reader-layout';
import { useSettingsStore } from '../settings.store';

/** Вигляд сторінки рідера за налаштуваннями: кольори теми, поля, вирівнювання. */
export function useReaderLook() {
  const theme = useSettingsStore((s) => s.readerTheme);
  const margin = useSettingsStore((s) => s.readerMargin);
  const align = useSettingsStore((s) => s.readerAlign);
  // Невідоме збережене значення (старіша версія) — тема «Зона»
  const palette = readerPalettes[theme] ?? readerPalettes.zone;

  return {
    palette,
    paddingHorizontal: READER_MARGINS[margin] ?? READER_MARGINS.normal,
    textAlign: align === 'justify' ? ('justify' as const) : ('left' as const),
  };
}
