import { describe, expect, test } from 'vitest';
import { orgOfRoleGroup } from './orgRoles';

describe('orgOfRoleGroup', () => {
  test.each([
    { name: 'acme-admins', scope: 'org:acme', expected: 'acme' },
    { name: 'acme-viewers', scope: 'org:acme', expected: 'acme' },
    { name: 'acme-ops', scope: 'org:acme', expected: null },
    { name: 'globex-admins', scope: 'org:acme', expected: null },
    { name: 'acme-admins', scope: 'system', expected: null },
    { name: 'dfe-admins', scope: 'system', expected: null },
  ])(
    '$name at $scope is a role group of $expected',
    ({ expected, ...group }) => {
      expect(orgOfRoleGroup(group)).toBe(expected);
    },
  );
});
