/**
 * Аналог Angular environments.
 * Значення беруться з .env / .env.local (у бандл потрапляють лише змінні з префіксом EXPO_PUBLIC_).
 */
export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
} as const;
