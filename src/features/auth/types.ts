/** Ролі: user — читач/автор історій; moderator — ще й перевіряє надіслане; admin — ще й керує ролями. */
export type Role = 'admin' | 'moderator' | 'user';

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
