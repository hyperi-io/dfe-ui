import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const reorderRuleBlocksPath = API_CONFIG.ingest.rulesOrder;

export const reorderRuleBlocks = (
  options: DfeClientRequestOptions<typeof reorderRuleBlocksPath, 'post'>,
) => apiClient.post(reorderRuleBlocksPath, options);
