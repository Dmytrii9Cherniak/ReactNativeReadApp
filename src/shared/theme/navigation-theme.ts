import { DarkTheme, type Theme } from 'expo-router';

import { colors } from './tokens';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.foreground,
    border: colors.border,
    notification: colors.danger,
  },
};
