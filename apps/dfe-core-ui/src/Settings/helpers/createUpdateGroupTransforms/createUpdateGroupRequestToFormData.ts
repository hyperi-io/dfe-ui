import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';

export const createUpdateGroupRequestToFormData = (
  request: TGroupDetailResponse,
): CreateUpdateGroupFormData => ({
  name: request.name,
  description: request.description,
  roles: request.roles,
  members: request.members,
  source_id: request.source_id,
  source_provider: request.source_provider,
});
