import { getReadingFont } from '../lib/reading-fonts';
import { READING_LINE_HEIGHT } from '../lib/text-size';
import { useSettingsStore } from '../settings.store';

import type { TextStyle } from 'react-native';

/** Стиль тексту книг і історій за налаштуваннями: шрифт і розмір. */
export function useReadingStyle(): TextStyle {
  const font = useSettingsStore((s) => s.readerFont);
  const fontSize = useSettingsStore((s) => s.readerFontSize);

  return {
    fontFamily: getReadingFont(font).fontFamily,
    fontSize,
    lineHeight: Math.round(fontSize * READING_LINE_HEIGHT),
  };
}
