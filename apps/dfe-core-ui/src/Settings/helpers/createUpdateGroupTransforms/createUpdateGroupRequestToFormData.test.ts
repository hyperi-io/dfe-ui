import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupDetailResponse } from '@/Settings/hooks/groups/useFetchGroupDetail/types';
import { describe, expect, test } from 'vitest';
import { createGroupTransformFormDataToRequest } from './createUpdateGroupFormDataToRequest';
import { createUpdateGroupRequestToFormData } from './createUpdateGroupRequestToFormData';

describe('createUpdateGroupRequestToFormData', () => {
  test('parses system scope', () => {
    const request: TGroupDetailResponse = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'system',
    };

    const expected: CreateUpdateGroupFormData = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'system',
      organisation: undefined,
    };

    expect(createUpdateGroupRequestToFormData(request)).toEqual(expected);
  });

  test('parses org:<organisation> scope', () => {
    const request: TGroupDetailResponse = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'org:acme',
    };

    expect(createUpdateGroupRequestToFormData(request)).toEqual({
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'org',
      organisation: 'acme',
    });
  });

  test('round-trips org-scoped detail through create request transform', () => {
    const request: TGroupDetailResponse = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'org:acme',
    };

    const formData = createUpdateGroupRequestToFormData(request);

    expect(createGroupTransformFormDataToRequest(formData)).toEqual({
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'org:acme',
    });
  });
});
