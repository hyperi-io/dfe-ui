import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const governanceChRbacReconcilePath =
  API_CONFIG.governance.reconcileChRbac;

export const reconcileGovernanceChRbacApi = (
  options: DfeClientRequestOptions<
    typeof governanceChRbacReconcilePath,
    'post'
  > = {},
) => apiClient.post(governanceChRbacReconcilePath, options);
