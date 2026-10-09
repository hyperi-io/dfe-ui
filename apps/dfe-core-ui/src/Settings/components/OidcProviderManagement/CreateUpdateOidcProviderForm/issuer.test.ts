import { describe, expect, test } from 'vitest';
import {
  buildEntraIssuer,
  buildOktaIssuer,
  issuerOnTypeChange,
  TEntraIssuerParts,
  TIssuerMode,
  TOktaIssuerParts,
} from './issuer';

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
