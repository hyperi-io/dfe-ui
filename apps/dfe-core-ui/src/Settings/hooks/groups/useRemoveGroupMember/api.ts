import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const removeGroupMemberPath = API_CONFIG.groups.groupMember;

export const removeGroupMember = (
  options: DfeClientRequestOptions<typeof removeGroupMemberPath, 'delete'>,
) => apiClient.delete(removeGroupMemberPath, options);
