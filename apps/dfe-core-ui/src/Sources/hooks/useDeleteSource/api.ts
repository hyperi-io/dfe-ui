import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteSourcePath = API_CONFIG.sources.source;

export const deleteSource = (
  options: DfeClientRequestOptions<typeof deleteSourcePath, 'delete'>,
) => apiClient.delete(deleteSourcePath, options);
