import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const deleteHuntPath = API_CONFIG.hunts.hunt;

export const deleteHunt = (
  options?: DfeClientRequestOptions<typeof deleteHuntPath, 'delete'>,
) => apiClient.delete(deleteHuntPath, options);
