import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const sourceCataloguesPath = API_CONFIG.sources.catalogue;

export const sourceCatalogues = (
  options: DfeClientRequestOptions<typeof sourceCataloguesPath, 'get'>,
) => apiClient.get(sourceCataloguesPath, options);
