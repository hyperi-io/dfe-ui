import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchSourceCataloguePath = API_CONFIG.sources.catalogue;

export const fetchSourceCatalogue = (
  options: DfeClientRequestOptions<typeof fetchSourceCataloguePath, 'get'>,
) => apiClient.get(fetchSourceCataloguePath, options);
