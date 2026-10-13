import { defaultGroupResolution } from '@/core/validationSchemas/oidcProviders.schema';
import { describe, expect, test } from 'vitest';
import {
  toCreateOidcProviderBody,
  toScopeList,
  toScopesRequest,
  toUpdateOidcProviderBody,
  type TStoredOidcProvider,
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
        groups: {
          ...defaultGroupResolution('okta'),
          mode: 'manual',
          enrich_on_login: true,
        },
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

    // The login credentials as the form shows them, against what the provider stores.
    test.each<{
      expected: Record<string, string>;
      name: string;
      saved: Partial<TStoredOidcProvider>;
      shown: Record<string, string>;
    }>([
      {
        name: 'an unedited client ID sends nothing',
        saved: { client_id: 'cid', client_id_env: 'ENTRA_ID' },
        shown: { client_id: 'cid' },
        expected: {},
      },
      {
        name: 'an edited client ID blanks its env var',
        saved: { client_id: 'cid', client_id_env: '' },
        shown: { client_id: 'rotated' },
        expected: { client_id: 'rotated', client_id_env: '' },
      },
      {
        name: 'an unedited client ID env var sends nothing',
        saved: { client_id: '', client_id_env: 'ENTRA_ID' },
        shown: { client_id_env: 'ENTRA_ID' },
        expected: {},
      },
      {
        name: 'a client ID switched to an env var blanks its value',
        saved: { client_id: 'cid', client_id_env: '' },
        shown: { client_id_env: 'ENTRA_ID' },
        expected: { client_id: '', client_id_env: 'ENTRA_ID' },
      },
      {
        name: 'a typed secret blanks its env var',
        saved: { client_secret_path: 'oidc/entra/client_secret' },
        shown: { client_secret: 's3cret' },
        expected: { client_secret: 's3cret', client_secret_env: '' },
      },
      {
        name: 'a blank secret sends nothing, keeping the stored one and its env var',
        saved: {
          client_secret_env: 'ENTRA_SECRET',
          client_secret_path: 'oidc/entra/client_secret',
        },
        shown: { client_secret: '' },
        expected: {},
      },
      {
        name: 'a stored secret switched to the env var it already names sends it',
        saved: {
          client_secret_env: 'ENTRA_SECRET',
          client_secret_path: 'oidc/entra/client_secret',
        },
        shown: { client_secret_env: 'ENTRA_SECRET' },
        expected: { client_secret_env: 'ENTRA_SECRET' },
      },
      {
        name: 'an unedited secret env var sends nothing',
        saved: { client_secret_env: 'ENTRA_SECRET', client_secret_path: '' },
        shown: { client_secret_env: 'ENTRA_SECRET' },
        expected: {},
      },
      {
        name: 'a secret env var cleared is sent blank',
        saved: { client_secret_env: 'ENTRA_SECRET', client_secret_path: '' },
        shown: { client_secret_env: '' },
        expected: { client_secret_env: '' },
      },
    ])('$name', ({ expected, saved, shown }) => {
      expect(toUpdateOidcProviderBody(shown, { ...stored, ...saved })).toEqual(
        expected,
      );
    });

    // The engine drops a stored secret for an env var name sent without a value, so these bodies decide it.
    test.each<{
      expected: Record<string, string>;
      name: string;
      path: string;
      shown: Record<string, string>;
    }>([
      {
        name: 'an unedited env var name sends nothing, keeping what is stored',
        path: '',
        shown: { client_secret_env: 'ENTRA_SECRET' },
        expected: {},
      },
      {
        name: 'a new env var name is sent without a value, replacing the stored secret',
        path: '',
        shown: { client_secret_env: 'ENTRA_DIRECTORY_SECRET' },
        expected: { client_secret_env: 'ENTRA_DIRECTORY_SECRET' },
      },
      {
        name: 'a typed secret is stored and its env var blanked',
        path: '',
        shown: { client_secret: 'rotated' },
        expected: { client_secret: 'rotated', client_secret_env: '' },
      },
      {
        name: 'a stored secret switched to the env var it already names sends it',
        path: 'oidc/entra/groups_client_secret',
        shown: { client_secret_env: 'ENTRA_SECRET' },
        expected: { client_secret_env: 'ENTRA_SECRET' },
      },
      {
        name: 'a stored secret left blank sends nothing',
        path: 'oidc/entra/groups_client_secret',
        shown: { client_secret: '' },
        expected: {},
      },
    ])('directory secret: $name', ({ expected, path, shown }) => {
      const groups = toUpdateOidcProviderBody(
        { groups: { mode: 'api', ...shown } },
        { ...stored, groups: { ...stored.groups, client_secret_path: path } },
      ).groups;

      expect({
        client_secret: groups?.client_secret,
        client_secret_env: groups?.client_secret_env,
      }).toEqual(expected);
    });

    test.each([
      ['an env var', { tenant_id: '', tenant_id_env: 'ENTRA_TENANT' }],
      ['a value', { tenant_id: 'tid', tenant_id_env: '' }],
      ['both', { tenant_id: 'tid', tenant_id_env: 'ENTRA_TENANT' }],
    ])(
      'a tenant stored as %s is sent back as the form carries it',
      (_source, tenant) => {
        const body = toUpdateOidcProviderBody(
          { groups: { mode: 'api', ...tenant } },
          { ...stored, groups: { ...stored.groups, ...tenant } },
        );

        expect(body.groups).toMatchObject(tenant);
      },
    );
  });
});
