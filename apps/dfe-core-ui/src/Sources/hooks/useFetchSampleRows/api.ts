import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { ENGINE_SCAN_DEADLINE_MS } from '@/core/config/engineTimeout';

export const sampleRowsPath = API_CONFIG.schemas.sampleRows;

export const sampleRows = (
  options: DfeClientRequestOptions<typeof sampleRowsPath, 'get'>,
) =>
  // A whole-table ClickHouse scan, which outlasts an ordinary read.
  apiClient.get(sampleRowsPath, {
    ...options,
    deadlineMs: ENGINE_SCAN_DEADLINE_MS,
  });
