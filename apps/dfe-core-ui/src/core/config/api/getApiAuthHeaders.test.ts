import {
  resetCachedSession,
  setCachedSession,
} from '@/core/auth/cachedSession';
import { beforeEach, describe, expect, test } from 'vitest';
import { getApiAuthHeaders } from './getApiAuthHeaders';

describe('getApiAuthHeaders', () => {
  beforeEach(() => {
    resetCachedSession();
  });

  test('returns Authorization when cached session has accessToken', async () => {
    setCachedSession({
      user: {
        id: 'test-user',
        accessToken: 'token123',
      },
      expires: '2099-01-01',
    });

    await expect(getApiAuthHeaders()).resolves.toEqual({
      Authorization: 'Bearer token123',
    });
  });

  test('returns empty object when there is no token', async () => {
    setCachedSession(null);

    await expect(getApiAuthHeaders()).resolves.toEqual({});
  });
});
