/**
 * Аналог Angular environments.
 * Значення беруться з .env / .env.local (у бандл потрапляють лише змінні з префіксом EXPO_PUBLIC_).
 */
export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  /**
   * Демо-режим: дані йдуть з тестового сервера в пам'яті (src/mock-backend).
   * Показує демо-акаунти на екрані входу. Вимкнеться, коли з'явиться справжній бекенд.
   */
  isDemo: true,
} as const;
