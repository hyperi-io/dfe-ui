import { CreateUpdateGroupFormData } from '@/Settings/components/GroupManagement/CreateUpdateGroupForm';
import { TGroupCreateRequestBody } from '@/Settings/hooks/groups/useCreateGroup/types';
import { TGroupUpdateRequestBody } from '@/Settings/hooks/groups/useUpdateGroup/types';
import { describe, expect, test } from 'vitest';
import {
  createGroupTransformFormDataToRequest,
  updateGroupTransformFormDataToRequest,
} from './createUpdateGroupFormDataToRequest';

const baseFormValues: CreateUpdateGroupFormData = {
  name: 'analysts',
  description: 'Analyst group',
  roles: ['role_a'],
  members: ['user_a'],
  scope: 'system',
};

describe('createGroupTransformFormDataToRequest', () => {
  test('maps system scope unchanged', () => {
    const expected: TGroupCreateRequestBody = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'system',
    };

    expect(createGroupTransformFormDataToRequest(baseFormValues)).toEqual(
      expected,
    );
  });

  test('maps org scope to org:<organisation>', () => {
    const values: CreateUpdateGroupFormData = {
      ...baseFormValues,
      scope: 'org',
      organisation: 'acme',
    };

    expect(createGroupTransformFormDataToRequest(values)).toEqual({
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'org:acme',
    });
  });

  test('defaults members to an empty array when omitted', () => {
    const { members: _members, ...withoutMembers } = baseFormValues;

    expect(
      createGroupTransformFormDataToRequest(
        withoutMembers as CreateUpdateGroupFormData,
      ).members,
    ).toEqual([]);
  });
});

describe('updateGroupTransformFormDataToRequest', () => {
  test('sends only updatable fields', () => {
    const expected: TGroupUpdateRequestBody = {
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
    };

    expect(updateGroupTransformFormDataToRequest(baseFormValues)).toEqual(
      expected,
    );
  });

  test('defaults members to an empty array when omitted', () => {
    const { members: _members, ...withoutMembers } = baseFormValues;

    expect(
      updateGroupTransformFormDataToRequest(
        withoutMembers as CreateUpdateGroupFormData,
      ),
    ).toEqual({
      description: 'Analyst group',
      roles: ['role_a'],
      members: [],
    });
  });
});
