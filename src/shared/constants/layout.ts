import { Platform } from 'react-native';

/** Висота нативного таб-бару — відступ знизу для скролу під табами. На web таби зверху. */
export const TAB_BAR_INSET = Platform.select({ ios: 50, android: 80, default: 0 });

/** Максимальна ширина контенту на широких екранах (web / планшети). */
export const MAX_CONTENT_WIDTH = 720;
