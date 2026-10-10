import { describe, expect, test } from 'vitest';
import { toScopeList, toScopesRequest } from './oidcProviders.helpers';

const GOOGLE_GROUPS_SCOPE =
  'https://www.googleapis.com/auth/cloud-identity.groups.readonly';

describe('oidcProviders.helpers', () => {
  describe('.toScopeList', () => {
    test('splits a space-separated scope string', () => {
      expect(
        toScopeList(`openid  email\tprofile ${GOOGLE_GROUPS_SCOPE}`),
      ).toEqual(['openid', 'email', 'profile', GOOGLE_GROUPS_SCOPE]);
    });

    test('keeps a list, splitting any entry that holds several scopes', () => {
      expect(toScopeList(['openid', 'email profile', ' ', ''])).toEqual([
        'openid',
        'email',
        'profile',
      ]);
    });

    test('reads nothing as no scopes', () => {
      expect(toScopeList(undefined)).toEqual([]);
      expect(toScopeList(null)).toEqual([]);
      expect(toScopeList('')).toEqual([]);
      expect(toScopeList('   ')).toEqual([]);
      expect(toScopeList([])).toEqual([]);
    });
  });

  describe('.toScopesRequest', () => {
    test('sends a non-empty list', () => {
      expect(toScopesRequest(['openid', 'email'])).toEqual({
        scopes: ['openid', 'email'],
      });
    });

    test('omits an empty list, which the engine refuses', () => {
      expect(toScopesRequest([])).toEqual({});
      expect(toScopesRequest(undefined)).toEqual({});
      expect(toScopesRequest(['', ' '])).toEqual({});
    });

    test('omits a list equal to the current scopes', () => {
      expect(toScopesRequest(['openid', 'email'], ['openid', 'email'])).toEqual(
        {},
      );
      expect(toScopesRequest(['openid', 'email'], 'openid email')).toEqual({});
    });

    test('sends a list that differs from the current scopes', () => {
      expect(
        toScopesRequest(['openid', 'email', 'groups'], ['openid', 'email']),
      ).toEqual({ scopes: ['openid', 'email', 'groups'] });
      expect(toScopesRequest(['email', 'openid'], ['openid', 'email'])).toEqual(
        { scopes: ['email', 'openid'] },
      );
    });

    test('an emptied list leaves the current scopes alone', () => {
      expect(toScopesRequest([], ['openid', 'email'])).toEqual({});
    });
  });
});
