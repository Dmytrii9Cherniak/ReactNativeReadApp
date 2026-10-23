import { mockServer } from '@/mock-backend';

import type { ProgressionApi } from './progression.api.types';

export const progressionApi: ProgressionApi = mockServer.progression;
