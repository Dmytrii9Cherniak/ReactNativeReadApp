import { Platform } from 'react-native';

/**
 * Дизайн-токени — єдине джерело значень для всіх стилів.
 * Стиль: темний «польовий ПДА» — олива, бурштин, моноширинні заголовки.
 */

export const colors = {
  background: '#0D0E0B',
  surface: '#171913',
  surfaceRaised: '#20231B',
  border: '#34382B',
  foreground: '#D9D4BE',
  muted: '#8C8870',
  primary: '#D29A2E',
  onPrimary: '#0D0E0B',
  success: '#8FA655',
  danger: '#B8472E',
} as const;

export type ColorToken = keyof typeof colors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 2,
  md: 4,
} as const;

export const borderWidth = {
  hairline: 1,
  accent: 3,
} as const;

export const fonts = {
  mono: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  serif: Platform.select({ ios: 'Georgia', default: 'serif' }),
} as const;

export const typography = {
  title: {
    fontFamily: fonts.mono,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heading: {
    fontFamily: fonts.mono,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  body: { fontSize: 16, lineHeight: 24 },
  reading: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 28 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18 },
  mono: {
    fontFamily: fonts.mono,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
} as const;

export type TypographyVariant = keyof typeof typography;
