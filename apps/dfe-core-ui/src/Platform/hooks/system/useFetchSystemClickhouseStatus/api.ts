import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { ENGINE_CLICKHOUSE_CLOUD_DEADLINE_MS } from '@/core/config/engineTimeout';

export const systemClickhouseStatusPath = API_CONFIG.system.clickhouseCloud;

// The engine tries the ClickHouse Cloud API 3 times before it answers.
export const fetchSystemClickhouseStatusApi = () =>
  apiClient.get(systemClickhouseStatusPath, {
    deadlineMs: ENGINE_CLICKHOUSE_CLOUD_DEADLINE_MS,
  });
