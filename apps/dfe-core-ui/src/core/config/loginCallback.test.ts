import { describe, expect, test } from 'vitest';
import {
  clientNavigationPathFromAuthUrl,
  loginRedirectPath,
  pathWithSearch,
  safeRedirectPath,
} from './loginCallback';

const ORIGIN = 'https://dfe.example.com';

describe('loginCallback helpers', () => {
  test('pathWithSearch joins pathname and query', () => {
    expect(pathWithSearch('/rules', '?name=foo')).toBe('/rules?name=foo');
  });

  test('loginRedirectPath encodes callback', () => {
    expect(loginRedirectPath('/rules?name=foo')).toBe(
      '/login?callbackUrl=%2Frules%3Fname%3Dfoo',
    );
  });

  test('clientNavigationPathFromAuthUrl keeps search from absolute URLs', () => {
    expect(
      clientNavigationPathFromAuthUrl(
        'http://localhost:3000/rules?name=foo&page=2',
      ),
    ).toBe('/rules?name=foo&page=2');
  });
});

describe('safeRedirectPath', () => {
  test('keeps a path on this console, with its query and hash', () => {
    expect(safeRedirectPath('/rules?name=foo#top', ORIGIN)).toBe(
      '/rules?name=foo#top',
    );
  });

  test('reduces an absolute URL on this origin to its path', () => {
    expect(safeRedirectPath(`${ORIGIN}/sources`, ORIGIN)).toBe('/sources');
  });

  // callbackUrl=/%5Cevil.example arrives decoded as '/\evil.example', which browsers read as //evil.example.
  test.each([
    '/\\evil.example',
    '//evil.example',
    '/\t/evil.example',
    ' //evil.example',
    '/.//evil.example',
    'https://evil.example/login',
    'javascript:alert(1)',
    'data:text/html,hi',
  ])('sends %j to the console home instead of off-origin', (candidate) => {
    expect(safeRedirectPath(candidate, ORIGIN)).toBe('/');
  });

  test.each([undefined, null, ''])('an absent target (%j) is home', (value) => {
    expect(safeRedirectPath(value, ORIGIN)).toBe('/');
  });

  test('without an origin only a relative path passes', () => {
    expect(safeRedirectPath('/rules')).toBe('/rules');
    expect(safeRedirectPath(`${ORIGIN}/rules`)).toBe('/');
    expect(safeRedirectPath('/\\evil.example')).toBe('/');
  });

  test('a malformed origin fails closed', () => {
    expect(safeRedirectPath('/rules', 'not a url')).toBe('/');
  });
});
