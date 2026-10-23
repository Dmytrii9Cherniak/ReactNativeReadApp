import { mockServer } from '@/mock-backend';

import type { ShelvesApi } from './shelves.api.types';

/** Єдина точка доступу до полиць. Зараз — тестовий сервер; з бекендом — HTTP-реалізація. */
export const shelvesApi: ShelvesApi = mockServer.shelves;
