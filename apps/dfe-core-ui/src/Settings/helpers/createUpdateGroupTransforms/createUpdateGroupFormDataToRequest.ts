import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupCreateRequestBody } from '@/Settings/hooks/useCreateGroup/types';
import { TGroupUpdateRequestBody } from '@/Settings/hooks/useUpdateGroup/types';

const toGroupScope = (
  scope: CreateUpdateGroupFormData['scope'],
  organisation?: string,
) => (scope === 'org' ? `${scope}:${organisation}` : scope);

export const createGroupTransformFormDataToRequest = (
  values: CreateUpdateGroupFormData,
): TGroupCreateRequestBody => {
  const {
    name,
    description,
    roles,
    members = [],
    scope,
    organisation,
  } = values;

  return {
    name,
    description,
    roles,
    members,
    scope: toGroupScope(scope, organisation),
  };
};

export const updateGroupTransformFormDataToRequest = (
  values: CreateUpdateGroupFormData,
): TGroupUpdateRequestBody => {
  const { description, roles, members = [] } = values;

  return { description, roles, members };
};
