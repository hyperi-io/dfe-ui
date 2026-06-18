import { getSession } from 'next-auth/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { getApiAuthHeaders } from './getApiAuthHeaders';

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

const getSessionMock = vi.mocked(getSession);

describe('getApiAuthHeaders', () => {
  beforeEach(() => {
    getSessionMock.mockReset();
  });

  test('returns Authorization when session has accessToken', async () => {
    getSessionMock.mockResolvedValue({
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
    getSessionMock.mockResolvedValue(null);

    await expect(getApiAuthHeaders()).resolves.toEqual({});
  });
});
