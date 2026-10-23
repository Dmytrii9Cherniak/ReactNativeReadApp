import { mockServer } from '@/mock-backend';

import type { UploadApi } from './upload.api.types';

export const uploadApi: UploadApi = mockServer.upload;
