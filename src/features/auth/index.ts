/** Публічний API фічі auth: вхід, реєстрація, ролі й дозволи. */
export { useAuthStore, useCan, useCurrentUser } from './auth.store';
export { can, ROLES, type Permission } from './lib/permissions';
export { LoginScreen } from './login-screen';
export { SignupScreen } from './signup-screen';
export { VerifyScreen } from './verify-screen';
export type { AuthApi } from './auth.api.types';
export type { Role, Session, User } from './types';
