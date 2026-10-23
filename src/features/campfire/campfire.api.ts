import { mockServer } from '@/mock-backend';

import type { CampfireApi } from './campfire.api.types';

export const campfireApi: CampfireApi = mockServer.campfire;
