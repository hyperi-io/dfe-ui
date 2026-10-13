import {
  CreateUpdateGroupFormData,
  GroupSourceLink,
} from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { isSourceLinkFieldChanged } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm/groupForm.schema';
import { TGroupCreateRequestBody } from '@/Settings/hooks/groups/useCreateGroup/types';
import { TGroupUpdateRequestBody } from '@/Settings/hooks/groups/useUpdateGroup/types';

const toGroupScope = (
  scope: CreateUpdateGroupFormData['scope'],
  organisation?: string,
) => (scope === 'org' ? `${scope}:${organisation}` : scope);

// The engine refuses a padded source ID because logins strip each group they assert before matching it.
const toGroupSourceLink = ({
  source_id,
  source_provider,
}: CreateUpdateGroupFormData) => ({
  source_id: source_id.trim(),
  source_provider: source_provider.trim(),
});

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
    ...toGroupSourceLink(values),
  };
};

// Re-sending a stored value trimmed would count as a link change, which the engine re-validates and checks against the caller's right to grant the group's roles.
const changedGroupSourceLink = (
  values: CreateUpdateGroupFormData,
  stored: GroupSourceLink,
) => {
  const link = toGroupSourceLink(values);
  return {
    ...(isSourceLinkFieldChanged(values.source_id, stored.source_id) && {
      source_id: link.source_id,
    }),
    ...(isSourceLinkFieldChanged(
      values.source_provider,
      stored.source_provider,
    ) && {
      source_provider: link.source_provider,
    }),
  };
};

export const updateGroupTransformFormDataToRequest = (
  values: CreateUpdateGroupFormData,
  stored: GroupSourceLink,
): TGroupUpdateRequestBody => {
  const { description, roles, members = [] } = values;

  return {
    description,
    roles,
    members,
    ...changedGroupSourceLink(values, stored),
  };
};
