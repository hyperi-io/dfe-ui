import { describe, expect, test } from 'vitest';
import {
  signInProviders,
  type TSignInAccount,
  type TSignInProvider,
} from './signInProviders';

const linked = (provider: string, provider_type: string) => ({
  email: 'kaz@example.test',
  key: `${provider}-kaz`,
  last_login_at: '',
  linked_at: '',
  provider,
  provider_type,
  subject: `${provider}-kaz`,
});

type TCase = {
  name: string;
  account: TSignInAccount;
  expected: TSignInProvider[];
};

describe('.signInProviders', () => {
  test.each<TCase>([
    {
      name: 'a local account with nothing linked has none',
      account: { external: false, identities: [], oidc_id: '', oidc_type: '' },
      expected: [],
    },
    {
      name: 'a local account ignores a stale oidc_id',
      account: {
        external: false,
        identities: [],
        oidc_id: 'okta',
        oidc_type: 'okta',
      },
      expected: [],
    },
    {
      name: 'an IdP account has the provider owning it',
      account: {
        external: true,
        identities: [],
        oidc_id: 'okta',
        oidc_type: 'okta',
      },
      expected: [{ name: 'okta', type: 'okta' }],
    },
    {
      name: 'an IdP account no login has reached yet has none',
      account: { external: true, identities: [], oidc_id: '', oidc_type: '' },
      expected: [],
    },
    {
      name: 'a local account has each linked sign-in',
      account: {
        external: false,
        identities: [linked('okta', 'okta'), linked('corp', 'google')],
        oidc_id: '',
        oidc_type: '',
      },
      expected: [
        { name: 'okta', type: 'okta' },
        { name: 'corp', type: 'google' },
      ],
    },
    {
      name: 'a provider is listed once, owner first',
      account: {
        external: true,
        identities: [linked('google', 'google'), linked('okta', 'okta')],
        oidc_id: 'okta',
        oidc_type: 'okta',
      },
      expected: [
        { name: 'okta', type: 'okta' },
        { name: 'google', type: 'google' },
      ],
    },
    {
      name: 'a provider no longer registered keeps an empty type',
      account: {
        external: false,
        identities: [linked('gone', '')],
        oidc_id: '',
        oidc_type: '',
      },
      expected: [{ name: 'gone', type: '' }],
    },
    {
      name: 'missing identities read as none',
      account: { external: false, oidc_id: '', oidc_type: '' },
      expected: [],
    },
  ])('$name', ({ account, expected }) => {
    expect(signInProviders(account)).toEqual(expected);
  });
});
