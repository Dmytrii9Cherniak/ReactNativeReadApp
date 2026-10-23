import { spacing } from '@/shared/theme';

export type ReaderMargin = 'narrow' | 'normal' | 'wide';
export type ReaderAlign = 'left' | 'justify';

/** Бічні поля тексту в рідері. */
export const READER_MARGINS: Record<ReaderMargin, number> = {
  narrow: spacing.md,
  normal: spacing.xl,
  wide: spacing.xxl * 1.5,
};

export const READER_MARGIN_ORDER: readonly ReaderMargin[] = ['narrow', 'normal', 'wide'];
export const READER_ALIGN_ORDER: readonly ReaderAlign[] = ['left', 'justify'];
