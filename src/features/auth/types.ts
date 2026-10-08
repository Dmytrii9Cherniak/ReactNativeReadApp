/** Користувач — як `PublicUser` на сервері. */
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  canModerateBooks: boolean;
  canModerateStories: boolean;
}

export type Permission = 'isAdmin' | 'canModerateBooks' | 'canModerateStories';

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * restoring — читаємо збережену сесію при старті;
 * guest — не увійшов; authenticated — увійшов.
 */
export type AuthStatus = 'restoring' | 'guest' | 'authenticated';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  password: string;
}
