import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useVerifyOidcLogin } from '.';
import { TVerifyOidcLoginResponse } from './types';
import { server } from './useVerifyOidcLogin.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useVerifyOidcLogin', () => {
  describe('name is provided', () => {
    test('should return verify oidc login response', async () => {
      const { result } = renderHook(
        () =>
          useVerifyOidcLogin({
            name: 'name',
          }),
        { wrapper },
      );

      const response: TVerifyOidcLoginResponse = {
        ok: true,
        checks: [
          {
            name: 'name',
            ok: true,
            detail: 'detail',
          },
        ],
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: response,
          isLoading: false,
          error: null,
          isRefetching: false,
          refetch: expect.any(Function),
        });
      });
    });
  });

  describe('name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useVerifyOidcLogin({ name: undefined }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
          isRefetching: false,
          refetch: expect.any(Function),
        });
      });
    });

    test('should not fetch when name is null', async () => {
      const { result } = renderHook(() => useVerifyOidcLogin({ name: null }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
          isRefetching: false,
          refetch: expect.any(Function),
        });
      });
    });
  });
});
