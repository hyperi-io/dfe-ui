import { describe, expect, test } from 'vitest';
import { shownAdminTabKeys } from './adminTabs';

describe('shownAdminTabKeys', () => {
  test.each<{
    expected: string[];
    name: string;
    permissions?: string[];
  }>([
    {
      name: 'every tab shows while the permissions are not yet known',
      expected: [
        'organisation-management',
        'role-management',
        'group-management',
        'account-management',
        'oidc-provider-management',
        'api-key-management',
      ],
    },
    {
      name: 'an admin of every org sees every tab',
      permissions: ['*'],
      expected: [
        'organisation-management',
        'role-management',
        'group-management',
        'account-management',
        'oidc-provider-management',
        'api-key-management',
      ],
    },
    {
      name: 'an org admin sees its accounts and identity providers',
      permissions: [
        'query:execute',
        'account:read',
        'account:write',
        'oidc:read',
        'oidc:write',
      ],
      expected: ['account-management', 'oidc-provider-management'],
    },
    {
      name: 'a viewer sees no tab',
      permissions: ['query:execute', 'source:read'],
      expected: [],
    },
  ])('$name', ({ expected, permissions }) => {
    expect(
      shownAdminTabKeys(permissions ? new Set(permissions) : undefined),
    ).toEqual(expected);
  });
});
