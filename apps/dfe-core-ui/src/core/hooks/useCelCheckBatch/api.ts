import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const checkCelBatchPath = API_CONFIG.cel.checkBatch;

export const checkCelBatch = (
  options: DfeClientRequestOptions<typeof checkCelBatchPath, 'post'>,
) => apiClient.post(checkCelBatchPath, options);
