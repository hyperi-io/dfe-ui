import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourceColumnsPath = API_CONFIG.sources.sourceColumns;

export const sourceColumns = (
  options: DfeClientRequestOptions<typeof sourceColumnsPath, 'get'>,
) => apiClient.get(sourceColumnsPath, options);
