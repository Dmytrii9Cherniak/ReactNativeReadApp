import { mockServer } from '@/mock-backend';

import type { AdminApi } from './admin.api.types';

export const adminApi: AdminApi = mockServer.admin;
