import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type ColorToken, type TypographyVariant } from '@/shared/theme';

const defaultColor: Record<TypographyVariant, ColorToken> = {
  appTitle: 'primaryLight',
  screenTitle: 'text',
  display: 'text',
  sectionLabel: 'textMuted',
  bookTitle: 'text',
  body: 'textSecondary',
  label: 'text',
  caption: 'textMuted',
  reading: 'text',
  mono: 'textMuted',
};

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
}

export function Text({ variant = 'body', color, style, ...props }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colors[color ?? defaultColor[variant]] }, style]}
      {...props}
    />
  );
}
