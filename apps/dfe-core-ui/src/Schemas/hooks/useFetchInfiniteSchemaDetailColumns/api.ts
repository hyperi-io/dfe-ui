import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const fetchInfiniteSchemaDetailColumnsPath =
  API_CONFIG.schemas.schemaDetail;

export const fetchInfiniteSchemaDetailColumns = (
  options: DfeClientRequestOptions<
    typeof fetchInfiniteSchemaDetailColumnsPath,
    'get'
  >,
) => apiClient.get(fetchInfiniteSchemaDetailColumnsPath, options);
