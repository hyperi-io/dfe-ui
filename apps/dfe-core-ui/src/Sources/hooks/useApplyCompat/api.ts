import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const applyCompatPath = API_CONFIG.ingest.compat;

export const applyCompat = (
  options: DfeClientRequestOptions<typeof applyCompatPath, 'put'>,
) => apiClient.put(applyCompatPath, options);
