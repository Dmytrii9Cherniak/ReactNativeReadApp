import { mockServer } from '@/mock-backend';

import type { AuthApi } from './auth.api.types';

/** Єдина точка доступу до авторизації. Зараз — тестовий сервер; з бекендом — HTTP-реалізація. */
export const authApi: AuthApi = mockServer.auth;
