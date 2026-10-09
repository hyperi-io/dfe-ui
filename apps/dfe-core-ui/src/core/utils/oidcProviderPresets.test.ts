import {
  CreateUpdateOidcProviderFormData,
  DEFAULT_GROUP_RESOLUTION,
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
  groups: DEFAULT_GROUP_RESOLUTION,
};

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
    });
  });

  test('fields the user typed are kept', () => {
    expect(
      presetFieldsForType({
        current: {
          ...GOOGLE_UNTOUCHED,
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
    });
  });

  test('an unknown type changes nothing', () => {
    expect(
      presetFieldsForType({ current: GOOGLE_UNTOUCHED, type: 'unknown' }),
    ).toEqual({});
  });
});
