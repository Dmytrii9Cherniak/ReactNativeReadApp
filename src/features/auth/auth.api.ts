import { requestJson, requestVoid } from '@/shared/api';

import type { RegisterInput, ResetPasswordInput, Session, User } from './types';

/** Ендпоінти /auth і /me — тонкі обгортки, без стану. Опис — README → API. */
export const authApi = {
  register: (input: RegisterInput) =>
    requestVoid('/auth/register', { method: 'POST', body: input }),

  verifyEmail: (email: string, code: string) =>
    requestJson<Session>('/auth/verify-email', { method: 'POST', body: { email, code } }),

  resendVerification: (email: string) =>
    requestVoid('/auth/resend-verification', { method: 'POST', body: { email } }),

  login: (email: string, password: string) =>
    requestJson<Session>('/auth/login', { method: 'POST', body: { email, password } }),

  refresh: (refreshToken: string) =>
    requestJson<Session>('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  logout: (refreshToken: string) =>
    requestVoid('/auth/logout', { method: 'POST', body: { refreshToken } }),

  forgotPassword: (email: string) =>
    requestVoid('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (input: ResetPasswordInput) =>
    requestJson<Session>('/auth/reset-password', { method: 'POST', body: input }),

  me: (accessToken: string) => requestJson<User>('/me', { accessToken }),
};
