import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';

export const createUpdateGroupRequestToFormData = (
  request: TGroupDetailResponse,
): CreateUpdateGroupFormData => {
  const [scope, organisation] = request.scope.split(':');

  return {
    ...request,
    name: request.name,
    description: request.description,
    roles: request.roles,
    members: request.members,
    scope: scope as CreateUpdateGroupFormData['scope'],
    organisation: organisation ?? undefined,
    source_id: request.source_id,
    source_provider: request.source_provider,
  };
};
