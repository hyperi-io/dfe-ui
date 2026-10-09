import {
  CreateUpdateOidcProviderFormData,
  DEFAULT_GROUP_RESOLUTION,
} from '@/core/validationSchemas/oidcProviders.schema';
import { describe, expect, test } from 'vitest';
import {
  forcedEnrichOnLogin,
  groupModeOptionsForType,
  presetFieldsForType,
} from './oidcProviderPresets';

type TGroupMode = (typeof DEFAULT_GROUP_RESOLUTION)['mode'];

const GOOGLE_UNTOUCHED: Partial<CreateUpdateOidcProviderFormData> = {
  name: 'google',
  type: 'okta',
  display_name: 'Google',
  issuer: 'https://accounts.google.com',
  client_id_env: 'DFE_OIDC_GOOGLE_CLIENT_ID',
  client_secret_env: 'DFE_OIDC_GOOGLE_CLIENT_SECRET',
  groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
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
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
    });
  });

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
      groups: { ...DEFAULT_GROUP_RESOLUTION, mode: 'api' },
    });
  });

  test.each<{
    expected: TGroupMode;
    mode: TGroupMode;
    name: string;
    type: string;
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
        current: withGroups({ admin_email: 'admin@example.com', mode }),
        type,
      }).groups,
    ).toEqual({
      ...DEFAULT_GROUP_RESOLUTION,
      admin_email: 'admin@example.com',
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

describe('groupModeOptionsForType', () => {
  test.each<{ expected: string[]; type?: string }>([
    { type: 'google', expected: ['api'] },
    { type: 'okta', expected: ['manual', 'token_claim', 'api'] },
    { type: 'entra_id', expected: ['manual', 'token_claim', 'api'] },
    { type: 'generic', expected: ['manual', 'token_claim'] },
    { type: undefined, expected: ['manual', 'token_claim', 'api'] },
  ])('type $type', ({ expected, type }) => {
    expect(
      groupModeOptionsForType({ type }).map((option) => option.value),
    ).toEqual(expected);
  });
});

describe('forcedEnrichOnLogin', () => {
  test.each<{ expected: boolean | undefined; mode?: string; type?: string }>([
    { type: 'google', mode: 'api', expected: true },
    { type: 'okta', mode: 'api', expected: undefined },
    { type: 'okta', mode: 'token_claim', expected: false },
    { type: 'okta', mode: 'manual', expected: false },
    { type: 'entra_id', mode: 'api', expected: false },
    { type: 'generic', mode: 'token_claim', expected: false },
    { type: undefined, mode: 'api', expected: undefined },
    { type: 'okta', mode: undefined, expected: undefined },
  ])('type $type in mode $mode', ({ expected, mode, type }) => {
    expect(forcedEnrichOnLogin({ mode, type })).toBe(expected);
  });
});
