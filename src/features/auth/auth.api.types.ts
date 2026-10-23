import type {
  ChangeEmailRequest,
  ChangePasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  Session,
  SignupRequest,
  User,
  VerifyRequest,
} from './types';

/**
 * Контракт авторизації й акаунта = майбутні ендпоінти:
 *   POST   /auth/login             { email, password }           → Session
 *   POST   /auth/signup            { nickname, email, password } → 202 (код надіслано на пошту)
 *   POST   /auth/verify            { email, code }               → Session
 *   POST   /auth/resend-code       { email }                     → 204
 *   POST   /auth/password/forgot   { email }                     → 202 (код на пошту; 202 і для невідомої пошти)
 *   POST   /auth/password/reset    { email, code, password }     → Session
 *   GET    /auth/me                                              → User     — токен
 *   POST   /auth/logout                                          → 204      — токен
 *   PATCH  /me                     { nickname }                  → User     — токен
 *   PUT    /me/email               { email, password }           → User     — токен
 *   PUT    /me/password            { currentPassword, newPassword } → 204   — токен
 *   DELETE /me                     { password }                  → 204      — токен (видаляє всі дані)
 */
export interface AuthApi {
  login(body: LoginRequest): Promise<Session>;
  signup(body: SignupRequest): Promise<void>;
  verify(body: VerifyRequest): Promise<Session>;
  resendCode(email: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(body: ResetPasswordRequest): Promise<Session>;
  me(): Promise<User>;
  logout(): Promise<void>;
  updateProfile(body: { nickname: string }): Promise<User>;
  changeEmail(body: ChangeEmailRequest): Promise<User>;
  changePassword(body: ChangePasswordRequest): Promise<void>;
  deleteAccount(body: { password: string }): Promise<void>;
}
