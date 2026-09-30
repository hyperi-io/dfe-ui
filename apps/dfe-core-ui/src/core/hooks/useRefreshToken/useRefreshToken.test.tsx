import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import type { Session } from 'next-auth';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useRefreshToken } from '.';

const renewSessionMock = vi.fn();

vi.mock('@/core/auth/renewSession', () => ({
  renewSession: () => renewSessionMock(),
}));

afterEach(() => {
  renewSessionMock.mockReset();
});

const { wrapper } = buildTestWrapper().withReactQuery();

const RENEWED: Session = {
  user: {
    id: 'admin',
    name: 'admin',
    accessToken: 'renewed-token',
    roles: ['admin'],
  },
  expires: '2099-01-01',
  accessTokenExpiresAt: 4_102_444_800_000,
};

describe('.useRefreshToken', () => {
  test('resolves to the session the server renewed', async () => {
    renewSessionMock.mockResolvedValue(RENEWED);
    const { result } = renderHook(() => useRefreshToken(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.data).toEqual(RENEWED);
    });
    expect(renewSessionMock).toHaveBeenCalledTimes(1);
  });

  test('surfaces a renewal the engine refused', async () => {
    renewSessionMock.mockRejectedValue(
      new Error('The engine did not renew the session'),
    );
    const { result } = renderHook(() => useRefreshToken(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.error?.message).toBe(
        'The engine did not renew the session',
      );
    });
  });
});
