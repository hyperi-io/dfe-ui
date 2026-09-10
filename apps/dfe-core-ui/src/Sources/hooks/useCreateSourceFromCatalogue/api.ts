import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createSourceFromCataloguePath = API_CONFIG.sources.fromCatalogue;

export const createSourceFromCatalogue = (
  options: DfeClientRequestOptions<
    typeof createSourceFromCataloguePath,
    'post'
  >,
) => apiClient.post(createSourceFromCataloguePath, options);
