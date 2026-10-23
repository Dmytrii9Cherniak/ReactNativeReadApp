import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { isApiError } from '@/shared/lib/api-error';
import { apiSession } from '@/shared/lib/api-session';
import { persistStorage } from '@/shared/lib/persist';

import { authApi } from './auth.api';
import { can, type Permission } from './lib/permissions';

import type { LoginRequest, Session, SignupRequest, User, VerifyRequest } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  /** Збережену сесію перевірено — можна показувати застосунок */
  isReady: boolean;
  login: (body: LoginRequest) => Promise<void>;
  signup: (body: SignupRequest) => Promise<void>;
  verify: (body: VerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  /** Після запуску: підставити збережений токен і оновити дані користувача */
  restore: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const startSession = ({ token, user }: Session) => {
        apiSession.setToken(token);
        set({ token, user });
      };

      const endSession = () => {
        apiSession.setToken(null);
        set({ token: null, user: null });
      };

      return {
        token: null,
        user: null,
        isReady: false,

        async login(body) {
          startSession(await authApi.login(body));
        },

        async signup(body) {
          await authApi.signup(body);
        },

        async verify(body) {
          startSession(await authApi.verify(body));
        },

        async logout() {
          try {
            await authApi.logout();
          } finally {
            endSession();
          }
        },

        async restore() {
          const { token } = get();

          apiSession.setToken(token);

          try {
            if (token) {
              // Роль могла змінитися, поки застосунок був закритий
              set({ user: await authApi.me() });
            }
          } catch (error) {
            // Токен недійсний або акаунт заблоковано — виходимо; без мережі лишаємо збережені дані
            if (isApiError(error, 'unauthorized') || isApiError(error, 'account_blocked')) {
              endSession();
            }
          } finally {
            // Застосунок показуємо за будь-якого результату — інакше вічна заставка
            set({ isReady: true });
          }
        },
      };
    },
    {
      name: 'auth',
      storage: persistStorage,
      partialize: ({ token, user }) => ({ token, user }),
      onRehydrateStorage: () => (state) => {
        void (state ?? useAuthStore.getState()).restore();
      },
    },
  ),
);

export const useCurrentUser = () => useAuthStore((s) => s.user);

/** Чи має поточний користувач дозвіл (гість — ні на що). */
export const useCan = (permission: Permission) => useAuthStore((s) => can(s.user, permission));
