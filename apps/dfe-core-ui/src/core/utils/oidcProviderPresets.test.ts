import {
  isEnrichOnLoginForced,
  type TGroupMode,
  type TOidcProviderType,
} from '@/core/helpers/oidcProviderFieldRules';
import {
  CreateUpdateOidcProviderFormData,
  DEFAULT_GROUP_RESOLUTION,
  defaultGroupResolution,
} from '@/core/validationSchemas/oidcProviders.schema';
import { describe, expect, test } from 'vitest';
import { presetFieldsForType } from './oidcProviderPresets';

const GOOGLE_UNTOUCHED: Partial<CreateUpdateOidcProviderFormData> = {
  name: 'google',
  type: 'okta',
  display_name: 'Google',
  issuer: 'https://accounts.google.com',
  client_id_env: 'DFE_OIDC_GOOGLE_CLIENT_ID',
  client_secret_env: 'DFE_OIDC_GOOGLE_CLIENT_SECRET',
  groups: defaultGroupResolution('google'),
};

const withGroups = (groups: Partial<typeof DEFAULT_GROUP_RESOLUTION>) => ({
  ...GOOGLE_UNTOUCHED,
  groups: { ...DEFAULT_GROUP_RESOLUTION, ...groups },
});

describe('presetFieldsForType', () => {
  test('fields still holding a preset take the new type preset', () => {
    expect(
      presetFieldsForType({ current: GOOGLE_UNTOUCHED, type: 'okta' }),
    ).toEqual({
      name: 'okta',
      type: 'okta',
      display_name: 'Okta',
      issuer: '',
      client_id_env: 'DFE_OIDC_OKTA_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_OKTA_CLIENT_SECRET',
      groups: defaultGroupResolution('okta'),
    });
  });

  test.each<{
    current: TGroupMode;
    enrich: boolean;
    expected: boolean;
    from: string;
    type: string;
  }>([
    {
      from: 'Google',
      current: 'api',
      enrich: true,
      type: 'okta',
      expected: false,
    },
    {
      from: 'Okta',
      current: 'api',
      enrich: false,
      type: 'google',
      expected: true,
    },
    {
      from: 'Okta set on',
      current: 'api',
      enrich: true,
      type: 'entra_id',
      expected: false,
    },
  ])(
    'Enrich on Login from $from follows the $type rule',
    ({ current, enrich, expected, type }) => {
      expect(
        presetFieldsForType({
          current: withGroups({ enrich_on_login: enrich, mode: current }),
          type,
        }).groups?.enrich_on_login,
      ).toBe(expected);
    },
  );

  test('fields the user typed are kept', () => {
    expect(
      presetFieldsForType({
        current: {
          ...withGroups({ mode: 'manual' }),
          name: 'corp-sso',
          display_name: 'Corp SSO',
          issuer: 'https://corp.okta.com',
          client_id_env: 'MY_CLIENT_ID',
          client_secret_env: 'MY_CLIENT_SECRET',
        },
        type: 'okta',
      }),
    ).toEqual({ type: 'okta' });
  });

  test('empty and missing fields take the new type preset', () => {
    expect(
      presetFieldsForType({
        current: { type: 'entra_id', client_id_env: '' },
        type: 'entra_id',
      }),
    ).toEqual({
      name: 'entra_id',
      type: 'entra_id',
      display_name: 'Entra ID',
      issuer: '',
      client_id_env: 'DFE_OIDC_ENTRA_CLIENT_ID',
      client_secret_env: 'DFE_OIDC_ENTRA_CLIENT_SECRET',
      groups: defaultGroupResolution('entra_id'),
    });
  });

  test.each<{
    expected: TGroupMode;
    mode: TGroupMode;
    name: string;
    type: TOidcProviderType;
  }>([
    {
      name: 'a default mode takes the new type default',
      mode: 'api',
      type: 'generic',
      expected: 'token_claim',
    },
    {
      name: 'the Custom default takes the Okta default',
      mode: 'token_claim',
      type: 'okta',
      expected: 'api',
    },
    {
      name: 'a chosen mode the new type refuses takes its default',
      mode: 'manual',
      type: 'google',
      expected: 'api',
    },
  ])('$name', ({ expected, mode, type }) => {
    expect(
      presetFieldsForType({
        current: withGroups({ domain: 'example.com', mode }),
        type,
      }).groups,
    ).toEqual({
      ...DEFAULT_GROUP_RESOLUTION,
      domain: 'example.com',
      enrich_on_login: isEnrichOnLoginForced(type),
      mode: expected,
    });
  });

  test('a chosen mode the new type accepts is kept', () => {
    expect(
      presetFieldsForType({
        current: withGroups({ mode: 'manual' }),
        type: 'entra_id',
      }),
    ).not.toHaveProperty('groups');
  });

  test('an unknown type changes nothing', () => {
    expect(
      presetFieldsForType({ current: GOOGLE_UNTOUCHED, type: 'unknown' }),
    ).toEqual({});
  });
});
