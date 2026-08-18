import { describe, expect, test } from 'vitest';
import { isNoAuthRoute } from './isNoAuthRoute';

describe('isNoAuthRoute', () => {
  test('matches login and setup wizard paths', () => {
    expect(isNoAuthRoute('/login')).toBe(true);
    expect(isNoAuthRoute('/setup')).toBe(true);
    expect(isNoAuthRoute('/setup/welcome')).toBe(true);
  });

  test('does not match authenticated app routes', () => {
    expect(isNoAuthRoute('/')).toBe(false);
    expect(isNoAuthRoute('/settings')).toBe(false);
  });
});
