/** Публічний API фічі auth: акаунт, сесія, гарди для UI і запитів. */
export { AccountCard } from './components/account-card';
export { AuthGate, GuestOnly } from './components/auth-gate';
export { ForgotPasswordScreen } from './forgot-password-screen';
export { LoginScreen } from './login-screen';
export { RegisterScreen } from './register-screen';
export { ResetPasswordScreen } from './reset-password-screen';
export { VerifyEmailScreen } from './verify-email-screen';
export { useAuthStatus, useAuthStore, useCurrentUser, withAuth } from './auth.store';
export type { AuthStatus, Permission, User } from './types';
