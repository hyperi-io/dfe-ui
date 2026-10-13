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
  source_id: '',
  source_provider: '',
};

const linkedFormValues: CreateUpdateGroupFormData = {
  ...baseFormValues,
  source_id: ' dfe-viewers ',
  source_provider: ' okta ',
};

describe('createGroupTransformFormDataToRequest', () => {
  test('maps system scope unchanged', () => {
    const expected: TGroupCreateRequestBody = {
      name: 'analysts',
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      scope: 'system',
      source_id: '',
      source_provider: '',
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
      source_id: '',
      source_provider: '',
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

  test('trims the source ID and provider it sends', () => {
    const request = createGroupTransformFormDataToRequest(linkedFormValues);

    expect(request.source_id).toBe('dfe-viewers');
    expect(request.source_provider).toBe('okta');
  });

  test('sends a whitespace-only source ID as unlinked', () => {
    const request = createGroupTransformFormDataToRequest({
      ...baseFormValues,
      source_id: '   ',
      source_provider: '\t',
    });

    expect(request.source_id).toBe('');
    expect(request.source_provider).toBe('');
  });
});

describe('updateGroupTransformFormDataToRequest', () => {
  const stored = { source_id: 'dfe-viewers', source_provider: 'okta' };
  const unchangedFormValues: CreateUpdateGroupFormData = {
    ...baseFormValues,
    ...stored,
  };

  test('sends only updatable fields', () => {
    const expected: TGroupUpdateRequestBody = {
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
    };

    expect(
      updateGroupTransformFormDataToRequest(unchangedFormValues, stored),
    ).toEqual(expected);
  });

  test('defaults members to an empty array when omitted', () => {
    const { members: _members, ...withoutMembers } = unchangedFormValues;

    expect(
      updateGroupTransformFormDataToRequest(
        withoutMembers as CreateUpdateGroupFormData,
        stored,
      ),
    ).toEqual({
      description: 'Analyst group',
      roles: ['role_a'],
      members: [],
    });
  });

  test.each([
    ['padded', ' padded-id '],
    ['600-character', 'a'.repeat(600)],
  ])(
    'leaves an unchanged %s stored source ID to the engine',
    (_label, storedSourceId) => {
      const request = updateGroupTransformFormDataToRequest(
        { ...unchangedFormValues, source_id: storedSourceId },
        { ...stored, source_id: storedSourceId },
      );

      expect(request).not.toHaveProperty('source_id');
      expect(request).not.toHaveProperty('source_provider');
    },
  );

  test('a typed space around a stored value leaves it unchanged', () => {
    const request = updateGroupTransformFormDataToRequest(
      {
        ...unchangedFormValues,
        source_id: 'dfe-viewers ',
        source_provider: ' okta',
      },
      stored,
    );

    expect(request).not.toHaveProperty('source_id');
    expect(request).not.toHaveProperty('source_provider');
  });

  test('sends a changed source ID and provider trimmed', () => {
    const expected: TGroupUpdateRequestBody = {
      description: 'Analyst group',
      roles: ['role_a'],
      members: ['user_a'],
      source_id: 'dfe-analysts',
      source_provider: 'entra',
    };

    expect(
      updateGroupTransformFormDataToRequest(
        {
          ...unchangedFormValues,
          source_id: ' dfe-analysts ',
          source_provider: ' entra ',
        },
        stored,
      ),
    ).toEqual(expected);
  });

  test('a cleared source ID is sent as empty', () => {
    const request = updateGroupTransformFormDataToRequest(
      { ...unchangedFormValues, source_id: '' },
      stored,
    );

    expect(request.source_id).toBe('');
    expect(request).not.toHaveProperty('source_provider');
  });

  test('a changed provider alone sends only the provider', () => {
    const request = updateGroupTransformFormDataToRequest(
      { ...unchangedFormValues, source_provider: 'corp-proxy ' },
      stored,
    );

    expect(request.source_provider).toBe('corp-proxy');
    expect(request).not.toHaveProperty('source_id');
  });
});
