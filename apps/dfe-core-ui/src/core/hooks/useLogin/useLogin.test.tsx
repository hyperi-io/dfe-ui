import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { useLogin } from '.';
import { TLoginRequest } from './types';

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
  getSession: vi.fn().mockResolvedValue(null),
  signIn: (...args: unknown[]) => mockSignIn(...args),
}));

afterEach(() => {
  mockPush.mockClear();
  mockRefresh.mockClear();
  mockSignIn.mockReset();
});

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useLogin', () => {
  test('should return user', async () => {
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ username: 'admin', password: 'password' });

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function) as (data: TLoginRequest) => Promise<void>,
        isPending: false,
        error: null,
        reset: expect.any(Function),
      });
    });

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  test('should preserve query string when the full URL is provided', async () => {
    mockSignIn.mockResolvedValue({
      url: 'https://example.com/rules?name=foo',
      error: null,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      username: 'admin',
      password: 'password',
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/rules?name=foo');
    });
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

  test.each(['/\\evil.example', '//evil.example', 'https://evil.example/x'])(
    'a callbackUrl of %j lands on the console home, not another site',
    async (callbackUrl) => {
      mockSignIn.mockResolvedValueOnce({ url: null, error: null });
      searchParamsRef.current = new URLSearchParams({ callbackUrl });

      const { result } = renderHook(() => useLogin(), { wrapper });

      result.current.mutate({ username: 'admin', password: 'password' });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    },
  );

  test('a NextAuth URL whose path reads as another host lands on the console home', async () => {
    mockSignIn.mockResolvedValueOnce({
      url: 'http://localhost//evil.example',
      error: null,
    });

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ username: 'admin', password: 'password' });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  test('when redirectOnSuccess is false, it refreshes without navigating', async () => {
    mockSignIn.mockResolvedValueOnce({ url: '/dashboard', error: null });

    const { result } = renderHook(
      () => useLogin({ redirectOnSuccess: false }),
      { wrapper },
    );

    result.current.mutate({ username: 'admin', password: 'password' });

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });
});
