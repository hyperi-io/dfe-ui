import { describe, expect, test } from 'vitest';
import { isNoAuthRoute } from './isNoAuthRoute';

describe('isNoAuthRoute', () => {
  test('matches the login paths', () => {
    expect(isNoAuthRoute('/login')).toBe(true);
    expect(isNoAuthRoute('/login/oidc')).toBe(true);
  });

  test('does not match the setup wizard, which runs behind the login', () => {
    // Counted as no-auth, a 401 on a dead engine token returns before the
    // sign-out, leaving the operator on a wizard nothing can recover.
    expect(isNoAuthRoute('/setup')).toBe(false);
    expect(isNoAuthRoute('/setup/welcome')).toBe(false);
  });

  test('does not match authenticated app routes', () => {
    expect(isNoAuthRoute('/')).toBe(false);
    expect(isNoAuthRoute('/settings')).toBe(false);
  });
});
