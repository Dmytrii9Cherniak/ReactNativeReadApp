import { mockServer } from '@/mock-backend';

import type { NotificationsApi } from './notifications.api.types';

export const notificationsApi: NotificationsApi = mockServer.notifications;
