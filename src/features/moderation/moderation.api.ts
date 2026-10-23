import { mockServer } from '@/mock-backend';

import type { ModerationApi } from './moderation.api.types';

export const moderationApi: ModerationApi = mockServer.moderation;
