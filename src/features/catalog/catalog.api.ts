import { mockServer } from '@/mock-backend';

import type { CatalogApi } from './catalog.api.types';

/**
 * Єдина точка доступу до каталогу. Зараз — тестовий сервер (src/mock-backend);
 * з бекендом тут з'явиться HTTP-реалізація того самого CatalogApi, екрани не зміняться.
 */
export const catalogApi: CatalogApi = mockServer.catalog;
