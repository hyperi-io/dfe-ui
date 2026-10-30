import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchCatalogueTagsPath = API_CONFIG.sources.catalogueTags;

export const fetchInfiniteFilteredSourceCatalogueTags = (
  options: DfeClientRequestOptions<typeof fetchCatalogueTagsPath, 'get'>,
) => apiClient.get(fetchCatalogueTagsPath, options);
