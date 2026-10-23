/**
 * Живі події тестового сервера — замість SSE / WebSocket справжнього бекенду.
 * admin — змінилась черга перевірки; notifications — є нові сповіщення.
 */
export type EventChannel = 'admin' | 'notifications';

type Listener = () => void;

const listeners: Record<EventChannel, Set<Listener>> = {
  admin: new Set(),
  notifications: new Set(),
};

export function subscribe(channel: EventChannel, listener: Listener): () => void {
  listeners[channel].add(listener);

  return () => {
    listeners[channel].delete(listener);
  };
}

/** Після поточного запиту: слухачі перечитують дані вже зі збереженою зміною. */
export function emit(channel: EventChannel): void {
  setTimeout(() => {
    listeners[channel].forEach((listener) => listener());
  }, 0);
}
