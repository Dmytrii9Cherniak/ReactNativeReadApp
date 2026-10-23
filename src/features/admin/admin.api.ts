import { mockServer } from '@/mock-backend';

import type { AdminApi } from './admin.api.types';

/** Єдина точка доступу до адмінки. Зараз — тестовий сервер; з бекендом — HTTP + SSE. */
export const adminApi: AdminApi = mockServer.admin;
