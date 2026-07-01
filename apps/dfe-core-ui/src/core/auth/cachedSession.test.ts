import { getSession } from 'next-auth/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { loadSession, resetCachedSession } from './cachedSession';

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

const getSessionMock = vi.mocked(getSession);

describe('loadSession', () => {
  beforeEach(() => {
    resetCachedSession();
    getSessionMock.mockReset();
  });

  afterEach(() => {
    resetCachedSession();
  });

  test('dedupes concurrent getSession calls', async () => {
    getSessionMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(
            () =>
              resolve({
                user: { id: 'u1', accessToken: 'tok' },
                expires: '2099-01-01',
              }),
            10,
          );
        }),
    );

    const [a, b] = await Promise.all([
      loadSession({ force: true }),
      loadSession({ force: true }),
    ]);

    expect(getSessionMock).toHaveBeenCalledTimes(1);
    expect(getSessionMock).toHaveBeenCalledWith({ broadcast: false });
    expect(a?.user?.accessToken).toBe('tok');
    expect(b?.user?.accessToken).toBe('tok');
  });
});
