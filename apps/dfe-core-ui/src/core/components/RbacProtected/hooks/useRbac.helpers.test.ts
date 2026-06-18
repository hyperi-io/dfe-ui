import { describe, expect, it } from 'vitest';
import { UI_DISPLAY_ACTIONS } from './rbac.constants';
import { isUserAuthorized } from './useRbac.helpers';

describe('isUserAuthorized', () => {
  it('returns true when the user has global * permission', () => {
    expect(
      isUserAuthorized(new Set(['*']), UI_DISPLAY_ACTIONS.schema_write),
    ).toBe(true);
  });

  it('returns true for an exact permission match', () => {
    expect(
      isUserAuthorized(
        new Set(['schemas:write']),
        UI_DISPLAY_ACTIONS.schema_write,
      ),
    ).toBe(true);
  });

  it('returns true when a parent scope wildcard matches', () => {
    expect(
      isUserAuthorized(new Set(['schemas:*']), UI_DISPLAY_ACTIONS.schema_write),
    ).toBe(true);
  });

  it('returns true for nested service scope wildcards', () => {
    expect(
      isUserAuthorized(
        new Set(['service:*:config:*']),
        'service:*:config:read',
      ),
    ).toBe(true);
  });

  it('returns false when no permission matches', () => {
    expect(
      isUserAuthorized(
        new Set(['schema:read']),
        UI_DISPLAY_ACTIONS.schema_write,
      ),
    ).toBe(false);
  });

  it('returns false for unrelated scope wildcards', () => {
    expect(
      isUserAuthorized(new Set(['alert:*']), UI_DISPLAY_ACTIONS.schema_write),
    ).toBe(false);
  });

  it('returns false for unrelated nested scope wildcards', () => {
    expect(
      isUserAuthorized(
        new Set(['service:*:config:read']),
        'service:*:config:write',
      ),
    ).toBe(false);
  });
});
