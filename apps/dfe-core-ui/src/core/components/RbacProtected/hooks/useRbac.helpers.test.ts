import { describe, expect, it } from 'vitest';
import { UI_DISPLAY_ACTIONS } from './rbac.constants';
import { isUserAuthorized } from './useRbac.helpers';

describe('isUserAuthorized', () => {
  it('returns true when the user has global * permission', () => {
    expect(
      isUserAuthorized(new Set(['*']), UI_DISPLAY_ACTIONS.SCHEMA_WRITE),
    ).toBe(true);
  });

  it('returns true for an exact permission match', () => {
    expect(
      isUserAuthorized(
        new Set(['schema:write']),
        UI_DISPLAY_ACTIONS.SCHEMA_WRITE,
      ),
    ).toBe(true);
  });

  it('returns true when a parent scope wildcard matches', () => {
    expect(
      isUserAuthorized(new Set(['schema:*']), UI_DISPLAY_ACTIONS.SCHEMA_WRITE),
    ).toBe(true);
  });

  it('returns true for nested service scope wildcards', () => {
    expect(
      isUserAuthorized(
        new Set(['service:*:config:*']),
        UI_DISPLAY_ACTIONS.SERVICE_CONFIG_READ,
      ),
    ).toBe(true);
  });

  it('returns true when permissions are provided as a Set', () => {
    expect(
      isUserAuthorized(new Set(['schema:*']), UI_DISPLAY_ACTIONS.SCHEMA_WRITE),
    ).toBe(true);
  });

  it('returns false when no permission matches', () => {
    expect(
      isUserAuthorized(
        new Set(['schema:read']),
        UI_DISPLAY_ACTIONS.SCHEMA_WRITE,
      ),
    ).toBe(false);
  });

  it('returns false for unrelated scope wildcards', () => {
    expect(
      isUserAuthorized(new Set(['alert:*']), UI_DISPLAY_ACTIONS.SCHEMA_WRITE),
    ).toBe(false);
  });
});
