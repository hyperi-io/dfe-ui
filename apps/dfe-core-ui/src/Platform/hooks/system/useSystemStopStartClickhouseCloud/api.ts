import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const systemStopClickhouseCloudPath =
  API_CONFIG.system.clickhouseCloudStop;

export const systemStopClickhouseCloudApi = (
  options: DfeClientRequestOptions<
    typeof systemStopClickhouseCloudPath,
    'post'
  > = {},
) => apiClient.post(systemStopClickhouseCloudPath, options);

export const systemStartClickhouseCloudPath =
  API_CONFIG.system.clickhouseCloudStart;

export const systemStartClickhouseCloudApi = (
  options: DfeClientRequestOptions<
    typeof systemStartClickhouseCloudPath,
    'post'
  > = {},
) => {
  return apiClient.post(systemStartClickhouseCloudPath, options);
};
