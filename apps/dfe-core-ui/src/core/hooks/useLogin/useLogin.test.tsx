import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useLogin } from '.';
import { LoginRequest } from './types';

// Custom mocks needed for useLogin
// These are mocked globally in vitest.setup.ts
// but we need to define specific mock behavior for this test file
const { mockPush, mockRefresh, mockSignIn, searchParamsRef } = vi.hoisted(
  () => ({
    mockPush: vi.fn(),
    mockRefresh: vi.fn(),
    mockSignIn: vi.fn(),
    searchParamsRef: { current: new URLSearchParams() },
  }),
);
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  useSearchParams: () => searchParamsRef.current,
}));
vi.mock('next-auth/react', () => ({
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

afterEach(() => {
  mockPush.mockClear();
  mockSignIn.mockReset();
});

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useAuthMe', () => {
  test('should return user', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ username: 'admin', password: 'password' });

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function) as (data: LoginRequest) => Promise<void>,
        isPending: false,
        error: null,
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('should use only the path if the full URL is provided', async () => {
    mockSignIn.mockResolvedValue({
      url: 'https://example.com/dashboard',
      error: null,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      username: 'admin',
      password: 'password',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('when using callback search param, it should use the value', async () => {
    mockSignIn.mockResolvedValueOnce({ url: null, error: null });
    searchParamsRef.current = new URLSearchParams(
      'callbackUrl=/other-dashboard',
    );

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ username: 'admin', password: 'password' });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/other-dashboard');
    });
  });
});
