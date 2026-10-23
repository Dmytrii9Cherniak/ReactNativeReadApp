import { Platform } from 'react-native';

/**
 * Дизайн-токени — єдине джерело значень для всіх стилів.
 * Палітра «Зона» (олива / темний) з макета Stalker Books.
 */
export const colors = {
  // Фони / поверхні
  background: '#141410',
  backgroundDeep: '#101008',
  surface: '#1B1B15',
  surfaceAlt: '#17170F',
  input: '#23261A',
  border: '#2A2A22',
  borderActive: '#454833',
  overlay: 'rgba(16, 16, 8, 0.6)',

  // Акцент «Зона»
  primary: '#5C7038',
  primaryLight: '#B8C08A',
  primaryPale: '#D7E4B0',
  primaryActive: '#3A4A26',
  onPrimary: '#141410',
  success: '#7FCB4E',
  successSurface: '#1E2A16',

  // Текст
  text: '#EDEAE0',
  textSecondary: '#C8C3A8',
  textMuted: '#8A8A7E',
  textFaint: '#6E6E60',

  // Статуси
  danger: '#E0685F',
  dangerSurface: '#2A1815',
  dangerBorder: '#502A28',
  /** Ранги від «Сталкера», ендгейм, поточне угруповання */
  gold: '#D4B44A',
  goldSurface: '#2A2413',
  /** Акцент «Біля вогнища» (див. campfireColors) */
  ember: '#FF8C42',
  onEmber: '#1A0F08',
  rating: '#C0A85A',
  warm: '#E0A98A',
  warmSurface: '#241D14',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Теми рідера: «Зона» — як застосунок; сепія — тепле «паперове» тло вдень;
 * ніч — чисто чорне тло (на AMOLED-екранах економить заряд) і приглушений текст.
 */
export const readerPalettes = {
  zone: { background: colors.background, text: colors.text, heading: colors.primaryLight },
  sepia: { background: '#F3EAD7', text: '#3F3122', heading: '#7A5A2F' },
  night: { background: '#000000', text: '#A9A9A0', heading: '#7E9160' },
} as const;

export type ReaderPaletteId = keyof typeof readerPalettes;

/** Тони заглушок обкладинок (поки немає зображення) — з допоміжної палітри макета. */
export const coverTones = ['#3A4028', '#4A3A28', '#2E3A3E', '#402828', '#4A5A33'] as const;

/**
 * Палітра «Історія біля вогнища» — окрема тепла тема розділу Campfire.
 * Використовується лише всередині цього розділу.
 */
export const campfireColors = {
  background: '#0F0B08',
  backgroundStory: '#120D08',
  card: '#1A130D',
  border: '#2E2016',
  buttonSurface: '#241811',
  buttonBorder: '#3A2A1C',
  buttonBorderActive: '#4A3624',
  onEmber: '#1A0F08',

  ember: '#FF8C42',
  emberAccent: '#E89355',
  emberDark: '#C9542E',

  title: '#F2E4D0',
  text: '#EFE1CC',
  body: '#D8C4A5',
  textSecondary: '#B4A188',
  textMuted: '#8A7860',

  glowStrong: 'rgba(255, 140, 66, 0.3)',
  glowTop: 'rgba(255, 140, 66, 0.16)',
  glowSoft: 'rgba(255, 140, 66, 0.12)',
  glowCard: 'rgba(232, 147, 90, 0.14)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const borderWidth = {
  hairline: 1,
  accent: 2,
} as const;

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
} as const;

export const typography = {
  /** «STALKER BOOKS» у шапці */
  appTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  /** Заголовок екрана в шапці: «МОЇ КНИГИ», «УВІЙТИ» */
  screenTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  /** Великий заголовок: назва книги на її сторінці */
  display: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  /** Підпис секції: «БІБЛІОТЕКА — 24 КНИГИ», «ПОЛИЦЯ» */
  sectionLabel: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  bookTitle: { fontSize: 13, lineHeight: 16, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16 },
  reading: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 28 },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
} as const;

export type TypographyVariant = keyof typeof typography;
