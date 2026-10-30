import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { ENGINE_SCAN_DEADLINE_MS } from '@/core/config/engineTimeout';

export const jsonPathsPath = API_CONFIG.schemas.jsonPaths;

export const jsonPaths = (
  options: DfeClientRequestOptions<typeof jsonPathsPath, 'get'>,
) =>
  // A whole-table ClickHouse scan, which outlasts an ordinary read.
  apiClient.get(jsonPathsPath, {
    ...options,
    deadlineMs: ENGINE_SCAN_DEADLINE_MS,
  });
