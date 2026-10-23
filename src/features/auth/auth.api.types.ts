import type { LoginRequest, Session, SignupRequest, User, VerifyRequest } from './types';

/**
 * Контракт авторизації = майбутні ендпоінти:
 *   POST /auth/login          { email, password }          → Session
 *   POST /auth/signup         { nickname, email, password } → 202 (код надіслано на пошту)
 *   POST /auth/verify         { email, code }              → Session
 *   POST /auth/resend-code    { email }                    → 204
 *   GET  /auth/me                                          → User   (потрібен токен)
 *   POST /auth/logout                                      → 204
 */
export interface AuthApi {
  login(body: LoginRequest): Promise<Session>;
  signup(body: SignupRequest): Promise<void>;
  verify(body: VerifyRequest): Promise<Session>;
  resendCode(email: string): Promise<void>;
  me(): Promise<User>;
  logout(): Promise<void>;
}
