import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { describe, expect, test } from 'vitest';
import {
  toCreateOidcProviderBody,
  toScopeList,
  toScopesRequest,
  toUpdateOidcProviderBody,
} from './oidcProviders.helpers';

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

  describe('.toCreateOidcProviderBody', () => {
    const create = {
      name: 'okta-workforce',
      enabled: true,
      type: 'okta' as const,
      display_name: 'Okta',
      issuer: 'https://acme.okta.com',
      client_id: 'c',
      client_id_env: '',
      client_secret: '',
      client_secret_env: '',
    };

    test('a manual-mode provider never sends enrich on login', () => {
      const body = toCreateOidcProviderBody({
        ...create,
        groups: { ...defaultGroupResolution('okta'), enrich_on_login: true },
      });

      expect(body.groups?.mode).toBe('manual');
      expect(body.groups?.enrich_on_login).toBe(false);
    });

    test('a field from another provider type is not sent', () => {
      const body = toCreateOidcProviderBody({
        ...create,
        groups: {
          ...defaultGroupResolution('okta'),
          mode: 'api',
          okta_domain: 'acme.okta.com',
          api_token_env: 'OKTA_TOKEN',
          tenant_id: 'tid',
        },
      });

      expect(body.groups).toMatchObject({
        okta_domain: 'acme.okta.com',
        api_token_env: 'OKTA_TOKEN',
        tenant_id: '',
      });
    });

    test('empty scopes are left to the provider type default', () => {
      expect(
        toCreateOidcProviderBody({ ...create, scopes: [] }),
      ).not.toHaveProperty('scopes');
    });
  });

  describe('.toUpdateOidcProviderBody', () => {
    // The setup status carries a provider with its scopes as one string.
    const stored = {
      type: 'entra_id',
      scopes: 'openid email profile',
      groups: {
        mode: 'api',
        claim_name: 'groups',
        sync_interval: 900,
        enrich_on_login: false,
        tenant_id: 'tid',
        tenant_id_env: '',
        client_secret_env: 'ENTRA_SECRET',
      },
    };

    test('sends none of the fields the engine update ignores', () => {
      const body = toUpdateOidcProviderBody(
        {
          name: 'entra',
          type: 'entra_id',
          issuer: 'https://login.microsoftonline.com/tid/v2.0',
          enabled: true,
          scopes: ['openid', 'email', 'profile'],
          groups: { mode: 'api' },
        },
        stored,
      );

      expect(body).not.toHaveProperty('name');
      expect(body).not.toHaveProperty('type');
      expect(body).not.toHaveProperty('issuer');
      expect(body).not.toHaveProperty('scopes');
      expect(body.groups).toMatchObject({
        tenant_id: 'tid',
        client_secret_env: 'ENTRA_SECRET',
        sync_interval: 900,
      });
    });

    test('a mode the directory fields do not apply to clears them', () => {
      const body = toUpdateOidcProviderBody(
        { groups: { mode: 'manual' } },
        stored,
      );

      expect(body.groups).toMatchObject({
        mode: 'manual',
        tenant_id: '',
        client_secret_env: '',
        sync_interval: 900,
      });
    });
  });
});
