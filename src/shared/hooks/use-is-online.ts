import { useNetInfo } from '@react-native-community/netinfo';

/**
 * iOS / Android: чи є з'єднання (`isConnected`). Перевірку «чи доступний інтернет»
 * не беремо: вона ходить на сторонній сервер і там, де його заблоковано, давала б
 * хибне «немає мережі». Поки стан невідомий — вважаємо, що мережа є.
 * Web-версія: use-is-online.web.ts
 */
export function useIsOnline(): boolean {
  return useNetInfo().isConnected !== false;
}
