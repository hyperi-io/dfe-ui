import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const bulkActionSourcesPath = API_CONFIG.sources.bulk;

export const bulkActionSources = (
  options: DfeClientRequestOptions<typeof bulkActionSourcesPath, 'post'>,
) => apiClient.post(bulkActionSourcesPath, options);
