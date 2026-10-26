import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const createBulkSourceFromCataloguePath =
  API_CONFIG.sources.fromCatalogue;

export const createBulkSourceFromCatalogue = (
  options: DfeClientRequestOptions<
    typeof createBulkSourceFromCataloguePath,
    'post'
  >,
) => apiClient.post(createBulkSourceFromCataloguePath, options);
