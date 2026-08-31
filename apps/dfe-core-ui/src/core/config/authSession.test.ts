import { describe, expect, test, vi } from 'vitest';
import {
  ACCESS_TOKEN_REFRESH_BUFFER_MS,
  MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS,
  isAppShellSession,
  shouldRefreshAccessToken,
} from './authSession';

describe('isAppShellSession', () => {
  test('returns false for null or missing access token', () => {
    expect(isAppShellSession(null)).toBe(false);
    expect(
      isAppShellSession({
        user: { name: 'u' },
        expires: '2026-01-01',
      }),
    ).toBe(false);
  });

  test('returns false when access token is expired', () => {
    expect(
      isAppShellSession({
        user: { name: 'u', accessToken: 'tok' },
        expires: '2026-01-01',
        error: 'AccessTokenExpired',
      }),
    ).toBe(false);
  });

  test('returns true for a usable session', () => {
    expect(
      isAppShellSession({
        user: { name: 'u', accessToken: 'tok' },
        expires: '2026-01-01',
      }),
    ).toBe(true);
  });
});

describe('shouldRefreshAccessToken', () => {
  test('returns true when session is marked expired', () => {
    expect(
      shouldRefreshAccessToken({
        sessionError: 'AccessTokenExpired',
        accessTokenExpiresAt: Date.now() + 60_000,
      }),
    ).toBe(true);
  });

  test('returns true within refresh buffer before expiry', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    const expiresAt = Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS - 1000;

    expect(
      shouldRefreshAccessToken({
        accessTokenExpiresAt: expiresAt,
      }),
    ).toBe(true);

    vi.useRealTimers();
  });

  test('returns false when expiry is far in the future', () => {
    expect(
      shouldRefreshAccessToken({
        accessTokenExpiresAt:
          Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS + 60_000,
      }),
    ).toBe(false);
  });

  test('returns false when a refresh was attempted recently', () => {
    expect(
      shouldRefreshAccessToken({
        sessionError: 'AccessTokenExpired',
        lastRefreshAttemptAt: Date.now() - 1000,
      }),
    ).toBe(false);
  });

  test('returns false when known client expiry is still valid', () => {
    expect(
      shouldRefreshAccessToken({
        sessionError: 'AccessTokenExpired',
        accessTokenExpiresAt: Date.now() - 1000,
        knownExpiresAt: Date.now() + ACCESS_TOKEN_REFRESH_BUFFER_MS + 60_000,
      }),
    ).toBe(false);
  });

  test('allows refresh again after minimum interval', () => {
    expect(
      shouldRefreshAccessToken({
        sessionError: 'AccessTokenExpired',
        lastRefreshAttemptAt:
          Date.now() - MIN_ACCESS_TOKEN_REFRESH_INTERVAL_MS - 1,
      }),
    ).toBe(true);
  });
});
