import { create } from 'zustand';

import { ApiError, isApiError } from '@/shared/api';

import { authApi } from './auth.api';
import { authStorage } from './auth.storage';

import type { AuthStatus, RegisterInput, ResetPasswordInput, Session, User } from './types';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  restore: () => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
  logout: () => Promise<void>;
}

/*
 * Токени — поза станом zustand: UI їх не показує, а оновлення токена
 * не повинне перерендерювати екрани.
 */
let accessToken: string | null = null;
let refreshToken: string | null = null;
/** Лише один refresh одночасно: сервер вважає повторне використання refresh-токена крадіжкою. */
let refreshInFlight: Promise<void> | null = null;

async function applySession(session: Session): Promise<void> {
  accessToken = session.accessToken;
  refreshToken = session.refreshToken;
  useAuthStore.setState({ status: 'authenticated', user: session.user });
  await authStorage.write({ refreshToken: session.refreshToken, user: session.user });
}

async function clearSession(): Promise<void> {
  accessToken = null;
  refreshToken = null;
  useAuthStore.setState({ status: 'guest', user: null });
  await authStorage.clear();
}

const notAuthenticated = () => new ApiError(401, 'unauthorized', 'Потрібно увійти');

function refreshSession(): Promise<void> {
  refreshInFlight ??= (async () => {
    try {
      if (!refreshToken) {
        throw notAuthenticated();
      }

      await applySession(await authApi.refresh(refreshToken));
    } catch (error) {
      // Сесію відкликано або вона прострочена — виходимо. Мережеві помилки сесію не скидають.
      if (isApiError(error, 'invalid_session')) {
        await clearSession();
      }

      throw error;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function getAccessToken(): Promise<string> {
  if (!accessToken) {
    await refreshSession();
  }

  if (!accessToken) {
    throw notAuthenticated();
  }

  return accessToken;
}

/**
 * Гард для запитів від імені користувача:
 * - без сесії запит НЕ відправляється (одразу ApiError 401 unauthorized);
 * - прострочений access-токен → одне оновлення сесії і повтор запиту.
 *
 * Приклад: `withAuth((token) => requestJson<Book[]>('/books', { accessToken: token }))`
 */
export async function withAuth<T>(call: (accessToken: string) => Promise<T>): Promise<T> {
  if (useAuthStore.getState().status !== 'authenticated') {
    throw notAuthenticated();
  }

  try {
    return await call(await getAccessToken());
  } catch (error) {
    if (!isApiError(error, 'invalid_token')) {
      throw error;
    }
  }

  await refreshSession();

  return call(await getAccessToken());
}

export const useAuthStore = create<AuthState>()(() => ({
  status: 'restoring',
  user: null,

  /**
   * Старт застосунку: збережена сесія показується одразу (працює й офлайн),
   * а у фоні сервер підтверджує її і віддає свіжі дані користувача.
   */
  async restore() {
    const stored = await authStorage.read();

    if (!stored) {
      useAuthStore.setState({ status: 'guest' });

      return;
    }

    refreshToken = stored.refreshToken;
    useAuthStore.setState({ status: 'authenticated', user: stored.user });

    // Помилку мережі ігноруємо (офлайн), відкликану сесію refreshSession скидає сам
    await refreshSession().catch(() => undefined);
  },

  register: (input) => authApi.register(input),

  async verifyEmail(email, code) {
    await applySession(await authApi.verifyEmail(email, code));
  },

  resendVerification: (email) => authApi.resendVerification(email),

  async login(email, password) {
    await applySession(await authApi.login(email, password));
  },

  forgotPassword: (email) => authApi.forgotPassword(email),

  async resetPassword(input) {
    await applySession(await authApi.resetPassword(input));
  },

  /** Локально виходимо завжди; якщо сервер недоступний — його токен просто дотермінує. */
  async logout() {
    const token = refreshToken;

    await clearSession();

    if (token) {
      await authApi.logout(token).catch(() => undefined);
    }
  },
}));

/* Селектори */
export const useAuthStatus = () => useAuthStore((s) => s.status);
export const useCurrentUser = () => useAuthStore((s) => s.user);
