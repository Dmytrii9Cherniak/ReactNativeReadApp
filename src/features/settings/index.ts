/** Публічний API фічі settings: яскравість, шрифт і розмір тексту книг, мова. */
export { BrightnessControl } from './components/brightness-control';
export { ReadingAppearance } from './components/reading-appearance';
export { useRestoreBrightness } from './hooks/use-brightness';
export { useReaderLook } from './hooks/use-reader-look';
export { useReadingStyle } from './hooks/use-reading-style';
export { READING_FONT_ASSETS, type ReadingFontId } from './lib/reading-fonts';
export { SettingsScreen } from './settings-screen';
export { useSettingsStore } from './settings.store';
