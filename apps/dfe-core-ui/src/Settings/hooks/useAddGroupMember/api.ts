import { apiClient } from '@/core/config/api';
import { DfeClientRequestOptions } from '@/core/config/api/client.types';
import { API_CONFIG } from '@/core/config/api/endpoints';

export const addGroupMemberPath = API_CONFIG.groups.groupMembers;

export const addGroupMember = (
  options: DfeClientRequestOptions<typeof addGroupMemberPath, 'post'>,
) => apiClient.post(addGroupMemberPath, options);
