/**
 * Токен поточної сесії. Його виставляє фіча auth; HTTP-клієнт (а поки — тестовий сервер
 * у src/mock-backend) читає його, щоб знати, від чийого імені запит.
 */
let token: string | null = null;

export const apiSession = {
  getToken: (): string | null => token,
  setToken(next: string | null): void {
    token = next;
  },
};
