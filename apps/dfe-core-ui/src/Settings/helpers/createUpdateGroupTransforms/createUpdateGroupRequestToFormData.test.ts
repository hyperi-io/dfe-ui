import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';
import { describe, expect, test } from 'vitest';
import { createGroupTransformFormDataToRequest } from './createUpdateGroupFormDataToRequest';
import { createUpdateGroupRequestToFormData } from './createUpdateGroupRequestToFormData';

const systemGroup: TGroupDetailResponse = {
  name: 'analysts',
  description: 'Analyst group',
  roles: ['role_a'],
  members: ['user_a'],
  scope: 'system',
  source_id: '',
  source_provider: '',
};

describe('createUpdateGroupRequestToFormData', () => {
  test('maps a group to the form', () => {
    const expected: CreateUpdateGroupFormData = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      source_id: '',
      source_provider: '',
    };

    expect(createUpdateGroupRequestToFormData(systemGroup)).toEqual(expected);
  });

  test('carries the source ID and provider into the form', () => {
    const request: TGroupDetailResponse = {
      ...systemGroup,
      source_id: 'dfe-viewers',
      source_provider: 'okta',
    };

    const formData = createUpdateGroupRequestToFormData(request);

    expect(formData.source_id).toBe('dfe-viewers');
    expect(formData.source_provider).toBe('okta');
  });

  test('round-trips a linked group through the create request transform', () => {
    const request: TGroupDetailResponse = {
      ...systemGroup,
      source_id: 'dfe-viewers',
      source_provider: 'okta',
    };

    const formData = createUpdateGroupRequestToFormData(request);

    expect(createGroupTransformFormDataToRequest(formData)).toEqual({
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      source_id: 'dfe-viewers',
      source_provider: 'okta',
    });
  });
});
