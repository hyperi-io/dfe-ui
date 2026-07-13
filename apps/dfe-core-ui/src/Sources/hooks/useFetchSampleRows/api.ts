import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sampleRowsPath = API_CONFIG.schemas.sampleRows;

export const sampleRows = (
  options: DfeClientRequestOptions<typeof sampleRowsPath, 'get'>,
) => apiClient.get(sampleRowsPath, options);
