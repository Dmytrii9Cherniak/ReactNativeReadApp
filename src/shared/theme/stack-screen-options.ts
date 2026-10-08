import { colors, typography } from './tokens';

/** Спільний вигляд заголовків для всіх Stack-навігаторів. */
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontFamily: typography.heading.fontFamily,
    fontWeight: typography.heading.fontWeight,
    color: colors.foreground,
  },
  contentStyle: { backgroundColor: colors.background },
} as const;
