import {
  defaultGroupResolution,
  DEFAULT_GROUP_RESOLUTION,
} from '@/core/validationSchemas/oidcProviders.schema';
import { describe, expect, test } from 'vitest';
import {
  GROUP_MODES_BY_TYPE,
  isDirectoryFieldUsed,
  isOidcProviderType,
  oidcProviderProblems,
  toAllowedGroups,
  type TOidcProviderType,
} from './oidcProviderFieldRules';

const TYPES: TOidcProviderType[] = ['google', 'entra_id', 'okta', 'generic'];

const groups = (overrides: Partial<typeof DEFAULT_GROUP_RESOLUTION>) => ({
  ...DEFAULT_GROUP_RESOLUTION,
  ...overrides,
});

describe('oidcProviderFieldRules', () => {
  describe('modes', () => {
    test('Google accepts only api and a custom provider never api', () => {
      expect(GROUP_MODES_BY_TYPE.google).toEqual(['api']);
      expect(GROUP_MODES_BY_TYPE.generic).toEqual(['manual', 'token_claim']);
      expect(GROUP_MODES_BY_TYPE.entra_id).toEqual([
        'manual',
        'token_claim',
        'api',
      ]);
      expect(GROUP_MODES_BY_TYPE.okta).toEqual([
        'manual',
        'token_claim',
        'api',
      ]);
    });
  });

  describe('.isOidcProviderType', () => {
    test('accepts the four engine types and nothing inherited', () => {
      for (const type of TYPES) {
        expect(isOidcProviderType(type)).toBe(true);
      }
      for (const value of ['toString', 'constructor', '', undefined, 3]) {
        expect(isOidcProviderType(value)).toBe(false);
      }
    });
  });

  describe('.toAllowedGroups', () => {
    test.each(TYPES)(
      'a new %s provider starts with a groups block the engine accepts',
      (type) => {
        const defaults = defaultGroupResolution(type);

        expect(GROUP_MODES_BY_TYPE[type]).toContain(defaults.mode);
        expect(toAllowedGroups(defaults, type)).toEqual(defaults);
      },
    );

    test.each([
      ['entra_id', 'api'],
      ['entra_id', 'manual'],
      ['generic', 'token_claim'],
      ['okta', 'manual'],
      ['okta', 'token_claim'],
    ] as const)(
      'refuses_enrich_on_login_outside_okta_and_google: %s in %s mode sends it off',
      (type, mode) => {
        expect(
          toAllowedGroups(groups({ mode, enrich_on_login: true }), type)
            .enrich_on_login,
        ).toBe(false);
      },
    );

    test('okta_api_with_enrich_on_login keeps the operator choice', () => {
      expect(
        toAllowedGroups(groups({ mode: 'api', enrich_on_login: true }), 'okta')
          .enrich_on_login,
      ).toBe(true);
      expect(
        toAllowedGroups(groups({ mode: 'api', enrich_on_login: false }), 'okta')
          .enrich_on_login,
      ).toBe(false);
    });

    test('google_api_without_enrichment is never sent: Google always enriches', () => {
      expect(
        toAllowedGroups(
          groups({ mode: 'api', enrich_on_login: false }),
          'google',
        ).enrich_on_login,
      ).toBe(true);
    });

    test('refuses_a_directory_field_in_manual_mode: the tenant is cleared', () => {
      const sent = toAllowedGroups(
        groups({
          mode: 'manual',
          tenant_id: 'tid',
          tenant_id_env: 'ENTRA_TENANT',
          client_secret: 'secret',
          client_secret_env: 'ENTRA_SECRET',
        }),
        'entra_id',
      );

      expect(sent).toMatchObject({
        tenant_id: '',
        tenant_id_env: '',
        client_secret: '',
        client_secret_env: '',
      });
    });

    test('refuses_another_types_field: an Okta domain on Entra is cleared', () => {
      expect(
        toAllowedGroups(
          groups({ mode: 'token_claim', okta_domain: 'acme.okta.com' }),
          'entra_id',
        ).okta_domain,
      ).toBe('');
    });

    test('refuses_google_fields_on_okta, keeping the Okta ones', () => {
      const sent = toAllowedGroups(
        groups({
          mode: 'api',
          api_token_env: 'OKTA_TOKEN',
          okta_domain: 'acme.okta.com',
          domain: 'acme.com',
          service_account_json: '{}',
          service_account_json_env: 'GOOGLE_SA',
        }),
        'okta',
      );

      expect(sent).toMatchObject({
        api_token_env: 'OKTA_TOKEN',
        okta_domain: 'acme.okta.com',
        domain: '',
        service_account_json: '',
        service_account_json_env: '',
      });
    });

    test('entra_token_claim_may_carry_overage_credentials', () => {
      const sent = toAllowedGroups(
        groups({
          mode: 'token_claim',
          tenant_id: 'tid',
          client_secret_env: 'ENTRA_SECRET',
        }),
        'entra_id',
      );

      expect(sent).toMatchObject({
        tenant_id: 'tid',
        client_secret_env: 'ENTRA_SECRET',
      });
    });

    test('refuses_a_directory_token_on_a_generic_provider', () => {
      const sent = toAllowedGroups(
        groups({
          mode: 'token_claim',
          api_token: 'token',
          api_token_env: 'TOKEN',
        }),
        'generic',
      );

      expect(sent).toMatchObject({ api_token: '', api_token_env: '' });
    });

    test('keeps the settings no rule covers', () => {
      const sent = toAllowedGroups(
        groups({ mode: 'manual', claim_name: 'roles', sync_interval: 900 }),
        'generic',
      );

      expect(sent).toMatchObject({ claim_name: 'roles', sync_interval: 900 });
    });

    test('every field it leaves set is one the type and mode use', () => {
      const everything = groups({
        enrich_on_login: true,
        service_account_json: '{}',
        service_account_json_env: 'SA',
        domain: 'acme.com',
        tenant_id: 'tid',
        tenant_id_env: 'TENANT',
        client_secret: 'secret',
        client_secret_env: 'SECRET',
        api_token: 'token',
        api_token_env: 'TOKEN',
        okta_domain: 'acme.okta.com',
      });
      const modeSettings = ['mode', 'claim_name', 'sync_interval'];
      for (const type of TYPES) {
        for (const mode of GROUP_MODES_BY_TYPE[type]) {
          const sent = toAllowedGroups({ ...everything, mode }, type);
          const setFields = Object.entries(sent)
            .filter(([field, value]) => value && !modeSettings.includes(field))
            .map(
              ([field]) => field as Parameters<typeof isDirectoryFieldUsed>[0],
            );
          for (const field of setFields) {
            expect(
              isDirectoryFieldUsed(field, type, mode),
              `${type}/${mode} sent ${field}`,
            ).toBe(true);
          }
        }
      }
    });
  });

  describe('.oidcProviderProblems', () => {
    const problemFields = (...args: Parameters<typeof oidcProviderProblems>) =>
      oidcProviderProblems(...args).map((problem) => problem.path.join('.'));

    test('generic_manual: a client id variable alone is enough', () => {
      expect(
        problemFields({
          type: 'generic',
          client_id_env: 'OIDC_CLIENT_ID',
          groups: groups({ mode: 'manual' }),
        }),
      ).toEqual([]);
    });

    test('missing_client_id', () => {
      expect(
        problemFields({ type: 'generic', groups: groups({ mode: 'manual' }) }),
      ).toEqual(['client_id']);
    });

    test('generic_refuses_api_mode', () => {
      const [problem] = oidcProviderProblems({
        type: 'generic',
        client_id: 'c',
        groups: groups({ mode: 'api' }),
      });

      expect(problem?.path).toEqual(['groups', 'mode']);
      expect(problem?.message).toBe(
        'A custom OIDC provider supports only these modes: Manual, Token Claim',
      );
    });

    test('google_refuses_token_claim_mode', () => {
      expect(
        problemFields({
          type: 'google',
          client_id: 'c',
          groups: groups({ mode: 'token_claim' }),
        }),
      ).toEqual(['groups.mode']);
    });

    test('google_api_needs_no_service_account', () => {
      expect(
        problemFields({
          type: 'google',
          client_id: 'c',
          groups: groups({ mode: 'api' }),
        }),
      ).toEqual([]);
    });

    test('okta_api_without_domain_or_token', () => {
      expect(
        problemFields({
          type: 'okta',
          client_id: 'c',
          groups: groups({ mode: 'api' }),
        }),
      ).toEqual(['groups.okta_domain', 'groups.api_token']);
    });

    test('okta_api_with_enrich_on_login: a stored token satisfies the token rule', () => {
      expect(
        problemFields(
          {
            type: 'okta',
            client_id: 'c',
            groups: groups({ mode: 'api', okta_domain: 'acme.okta.com' }),
          },
          { groups: { api_token_path: 'oidc/okta/groups_api_token' } },
        ),
      ).toEqual([]);
    });

    test('entra_api_without_tenant_or_any_secret', () => {
      expect(
        problemFields({
          type: 'entra_id',
          client_id: 'c',
          groups: groups({ mode: 'api' }),
        }),
      ).toEqual(['groups.tenant_id', 'groups.client_secret']);
    });

    test('entra_api_falls_back_to_the_login_secret', () => {
      expect(
        problemFields(
          {
            type: 'entra_id',
            client_id: 'c',
            groups: groups({ mode: 'api', tenant_id_env: 'ENTRA_TENANT' }),
          },
          { client_secret_path: 'oidc/entra/client_secret' },
        ),
      ).toEqual([]);
    });

    test('entra_api_with_its_own_secret', () => {
      expect(
        problemFields({
          type: 'entra_id',
          client_id: 'c',
          groups: groups({
            mode: 'api',
            tenant_id: 'tid',
            client_secret_env: 'ENTRA_SECRET',
          }),
        }),
      ).toEqual([]);
    });

    test('entra_token_claim_needs_no_directory_credentials', () => {
      expect(
        problemFields({
          type: 'entra_id',
          client_id: 'c',
          groups: groups({ mode: 'token_claim' }),
        }),
      ).toEqual([]);
    });
  });
});
