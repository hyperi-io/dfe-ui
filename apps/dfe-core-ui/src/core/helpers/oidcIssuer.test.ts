import { describe, expect, test } from 'vitest';
import {
  buildEntraIssuer,
  buildOktaIssuer,
  entraTenantFromIssuer,
  issuerHost,
  issuerOnTypeChange,
  suggestedCredentialEnv,
  suggestedProviderName,
  TEntraIssuerParts,
  TIssuerMode,
  TOktaIssuerParts,
} from './oidcIssuer';

const BUILT = {
  entra_id: 'https://login.microsoftonline.com/tenant-guid/v2.0',
  okta: 'https://dev-123.okta.com',
};

describe('buildOktaIssuer', () => {
  test.each<{ expected: string; name: string; parts: TOktaIssuerParts }>([
    {
      name: 'an org domain',
      parts: { domain: 'dev-123.okta.com' },
      expected: 'https://dev-123.okta.com',
    },
    {
      name: 'a pasted org URL with a trailing slash',
      parts: { domain: 'https://dev-123.okta.com/' },
      expected: 'https://dev-123.okta.com',
    },
    {
      name: 'a pasted custom authorization server URL keeps its path',
      parts: { domain: 'https://dev-123.okta.com/oauth2/default/' },
      expected: 'https://dev-123.okta.com/oauth2/default',
    },
    {
      name: 'an http URL with several trailing slashes',
      parts: { domain: 'HTTP://dev-123.okta.com//' },
      expected: 'https://dev-123.okta.com',
    },
    {
      name: 'a custom domain',
      parts: { domain: 'id.example.com' },
      expected: 'https://id.example.com',
    },
    {
      name: 'surrounding whitespace',
      parts: { domain: ' dev-123.okta.com ' },
      expected: 'https://dev-123.okta.com',
    },
    { name: 'an empty domain', parts: { domain: '' }, expected: '' },
    {
      name: 'a domain that is only a scheme',
      parts: { domain: 'https://' },
      expected: '',
    },
  ])('$name', ({ expected, parts }) => {
    expect(buildOktaIssuer(parts)).toBe(expected);
  });
});

describe('issuerHost', () => {
  test.each([
    ['https://dev-123.okta.com', 'dev-123.okta.com'],
    ['https://dev-123.okta.com/oauth2/default', 'dev-123.okta.com'],
    [' HTTPS://id.example.com/ ', 'id.example.com'],
    ['', ''],
  ])('issuer "%s"', (issuer, expected) => {
    expect(issuerHost({ issuer })).toBe(expected);
  });
});

describe('suggestedProviderName', () => {
  test.each<{
    expected: string;
    issuer: string;
    name: string;
    trustedEmailDomains?: string[];
    type: 'google' | 'entra_id' | 'okta' | 'generic';
  }>([
    {
      name: 'okta with no issuer yet',
      type: 'okta',
      issuer: '',
      expected: 'okta',
    },
    {
      name: 'okta org domain',
      type: 'okta',
      issuer: 'https://integrator-8938607.okta.com/oauth2/default',
      expected: 'okta-integrator-8938607',
    },
    {
      name: 'okta preview domain',
      type: 'okta',
      issuer: 'https://dev-1.oktapreview.com',
      expected: 'okta-dev-1',
    },
    {
      name: 'okta custom domain keeps the host',
      type: 'okta',
      issuer: 'https://login.corp.com',
      expected: 'okta-login.corp.com',
    },
    {
      name: 'entra tenant ID keeps its first block',
      type: 'entra_id',
      issuer:
        'https://login.microsoftonline.com/7225ac34-c752-42e4-bb89-d60e419f6de0/v2.0',
      expected: 'entra-7225ac34',
    },
    {
      name: 'entra tenant domain keeps its first label',
      type: 'entra_id',
      issuer: 'https://login.microsoftonline.com/contoso.onmicrosoft.com/v2.0',
      expected: 'entra-contoso',
    },
    {
      name: 'entra multi-tenant alias names no tenant',
      type: 'entra_id',
      issuer: 'https://login.microsoftonline.com/common/v2.0',
      expected: 'entra',
    },
    {
      name: 'google takes the first trusted domain',
      type: 'google',
      issuer: 'https://accounts.google.com',
      trustedEmailDomains: ['hyperi.io', 'corp.com'],
      expected: 'google-hyperi.io',
    },
    {
      name: 'google with no trusted domain',
      type: 'google',
      issuer: 'https://accounts.google.com',
      expected: 'google',
    },
    {
      name: 'custom placeholder issuer names nothing',
      type: 'generic',
      issuer: 'https://your-custom-oidc-provider.com',
      expected: 'custom',
    },
    {
      name: 'custom issuer host, case and stray characters cleaned',
      type: 'generic',
      issuer: 'https://Dex.Corp.com:5556/dex',
      expected: 'custom-dex.corp.com-5556',
    },
  ])('$name', ({ expected, issuer, trustedEmailDomains = [], type }) => {
    expect(suggestedProviderName({ issuer, trustedEmailDomains, type })).toBe(
      expected,
    );
  });
});

describe('suggestedCredentialEnv', () => {
  test.each<{
    expected: string;
    name: string;
    suffix: 'CLIENT_ID' | 'CLIENT_SECRET';
  }>([
    { name: 'okta', suffix: 'CLIENT_ID', expected: 'DFE_OIDC_OKTA_CLIENT_ID' },
    {
      name: 'okta-integrator-8938607',
      suffix: 'CLIENT_SECRET',
      expected: 'DFE_OIDC_OKTA_INTEGRATOR_8938607_CLIENT_SECRET',
    },
    {
      name: 'google-hyperi.io',
      suffix: 'CLIENT_ID',
      expected: 'DFE_OIDC_GOOGLE_HYPERI_IO_CLIENT_ID',
    },
    { name: '--', suffix: 'CLIENT_ID', expected: '' },
  ])('name "$name"', ({ expected, name, suffix }) => {
    expect(suggestedCredentialEnv({ name, suffix })).toBe(expected);
  });
});

describe('entraTenantFromIssuer', () => {
  test.each([
    ['https://login.microsoftonline.com/tenant-guid/v2.0', 'tenant-guid'],
    ['https://tenant-guid.ciamlogin.com/tenant-guid/v2.0', 'tenant-guid'],
    ['https://login.microsoftonline.com', ''],
    ['', ''],
    ['https://login.microsoftonline.com/common/v2.0', ''],
    ['https://login.microsoftonline.com/organizations/v2.0', ''],
    ['https://login.microsoftonline.com/Consumers/v2.0', ''],
  ])('issuer "%s"', (issuer, expected) => {
    expect(entraTenantFromIssuer({ issuer })).toBe(expected);
  });
});

describe('buildEntraIssuer', () => {
  test.each<{ expected: string; parts: TEntraIssuerParts }>([
    {
      parts: { tenantId: 'tenant-guid' },
      expected: 'https://login.microsoftonline.com/tenant-guid/v2.0',
    },
    {
      parts: { tenantId: ' tenant-guid ' },
      expected: 'https://login.microsoftonline.com/tenant-guid/v2.0',
    },
    { parts: { tenantId: '' }, expected: '' },
    { parts: { tenantId: '  ' }, expected: '' },
  ])('tenant "$parts.tenantId"', ({ expected, parts }) => {
    expect(buildEntraIssuer(parts)).toBe(expected);
  });
});

describe('issuerOnTypeChange', () => {
  test.each<{
    current: unknown;
    expected: { issuer: string; mode: TIssuerMode };
    name: string;
    type: string;
  }>([
    {
      name: 'Google takes its fixed issuer over a typed one',
      current: 'https://idp.example.com',
      type: 'google',
      expected: { issuer: 'https://accounts.google.com', mode: 'guided' },
    },
    {
      name: 'Okta builds from its guided fields when the issuer is empty',
      current: '',
      type: 'okta',
      expected: { issuer: BUILT.okta, mode: 'guided' },
    },
    {
      name: 'Entra ID replaces the issuer Okta built',
      current: BUILT.okta,
      type: 'entra_id',
      expected: { issuer: BUILT.entra_id, mode: 'guided' },
    },
    {
      name: 'Okta replaces the Google preset',
      current: 'https://accounts.google.com',
      type: 'okta',
      expected: { issuer: BUILT.okta, mode: 'guided' },
    },
    {
      name: 'Entra ID keeps a typed issuer for Manual entry',
      current: 'https://idp.example.com',
      type: 'entra_id',
      expected: { issuer: 'https://idp.example.com', mode: 'manual' },
    },
    {
      name: 'a custom provider replaces a built issuer with its preset',
      current: BUILT.entra_id,
      type: 'generic',
      expected: {
        issuer: 'https://your-custom-oidc-provider.com',
        mode: 'guided',
      },
    },
    {
      name: 'a custom provider replaces a missing issuer with its preset',
      current: undefined,
      type: 'generic',
      expected: {
        issuer: 'https://your-custom-oidc-provider.com',
        mode: 'guided',
      },
    },
    {
      name: 'a custom provider keeps a typed issuer',
      current: 'https://idp.example.com',
      type: 'generic',
      expected: { issuer: 'https://idp.example.com', mode: 'manual' },
    },
  ])('$name', ({ current, expected, type }) => {
    expect(issuerOnTypeChange({ built: BUILT, current, type })).toEqual(
      expected,
    );
  });
});
