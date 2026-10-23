import { Arimo_400Regular } from '@expo-google-fonts/arimo';
import { Literata_400Regular } from '@expo-google-fonts/literata';
import { PTSerif_400Regular } from '@expo-google-fonts/pt-serif';
import { Roboto_400Regular } from '@expo-google-fonts/roboto';
import { Tinos_400Regular } from '@expo-google-fonts/tinos';

export type ReadingFontId = 'literata' | 'pt-serif' | 'times' | 'arial' | 'roboto';

export interface ReadingFont {
  id: ReadingFontId;
  label: string;
  /** Ім'я, під яким шрифт зареєстровано в useFonts */
  fontFamily: string;
}

/**
 * Шрифти для книг. Times New Roman і Arial — пропрієтарні, тому вбудовано
 * їхні метричні копії з відкритою ліцензією: Tinos і Arimo (вигляд і розміри ті самі).
 * Усі з кирилицею.
 */
export const READING_FONTS: readonly ReadingFont[] = [
  { id: 'literata', label: 'Literata', fontFamily: 'Literata_400Regular' },
  { id: 'pt-serif', label: 'PT Serif', fontFamily: 'PTSerif_400Regular' },
  { id: 'times', label: 'Times New Roman', fontFamily: 'Tinos_400Regular' },
  { id: 'arial', label: 'Arial', fontFamily: 'Arimo_400Regular' },
  { id: 'roboto', label: 'Roboto', fontFamily: 'Roboto_400Regular' },
];

/** Файли шрифтів для useFonts у кореневому layout. */
export const READING_FONT_ASSETS = {
  Literata_400Regular,
  PTSerif_400Regular,
  Tinos_400Regular,
  Arimo_400Regular,
  Roboto_400Regular,
};

export function getReadingFont(id: ReadingFontId): ReadingFont {
  return READING_FONTS.find((font) => font.id === id) ?? READING_FONTS[0];
}
