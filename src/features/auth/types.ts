/** Ролі: user — читач і автор; admin — ще й перевіряє надіслане та керує застосунком. */
export type Role = 'admin' | 'user';

/** Поточний користувач — так його повертає бекенд (GET /auth/me). */
export interface User {
  id: string;
  nickname: string;
  email: string;
  role: Role;
  createdAt: string;
}

/** Відповідь на вхід: токен для заголовка Authorization + користувач. */
export interface Session {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
}

export interface ChangeEmailRequest {
  email: string;
  /** Поточний пароль — підтвердження, що це власник акаунта */
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
