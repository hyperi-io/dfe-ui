import { describe, expect, test } from 'vitest';
import {
  clientNavigationPathFromAuthUrl,
  loginRedirectPath,
  pathWithSearch,
} from './loginCallback';

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
