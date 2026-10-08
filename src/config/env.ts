import Constants from 'expo-constants';

/** Порт API в розробці — як PORT у server/.env. */
const DEV_API_PORT = 3000;

/**
 * Адреса API:
 * - EXPO_PUBLIC_API_URL, якщо задана (продакшн, тунель, інший комп'ютер);
 * - інакше — той самий комп'ютер, де працює Metro. Телефон знає його IP з hostUri
 *   («192.168.1.23:8081»), тож вписувати свою IP вручну не потрібно.
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';

  return `http://${host}:${DEV_API_PORT}`;
}

/**
 * Аналог Angular environments.
 * Значення беруться з .env / .env.local (у бандл потрапляють лише змінні з префіксом EXPO_PUBLIC_).
 */
export const env = {
  appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
  apiUrl: resolveApiUrl(),
} as const;
