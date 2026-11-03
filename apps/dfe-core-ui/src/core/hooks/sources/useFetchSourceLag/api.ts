import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourceLagPath = API_CONFIG.sources.sourceLag;

export const fetchSourceLagApi = (
  options: DfeClientRequestOptions<typeof sourceLagPath, 'get'>,
) => apiClient.get(sourceLagPath, options);
