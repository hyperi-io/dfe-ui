import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchSchemasPath = API_CONFIG.schemas.default;

export const fetchInfiniteFilteredSchemas = (
  options: DfeClientRequestOptions<typeof fetchSchemasPath, 'get'>,
) => apiClient.get(fetchSchemasPath, options);
