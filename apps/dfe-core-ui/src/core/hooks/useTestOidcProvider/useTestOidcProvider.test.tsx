import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useTestOidcProvider } from '.';
import { TTestOidcProviderResponse } from './types';
import { server } from './useTestOidcProvider.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useTestOidcProvider', () => {
  describe('name is provided', () => {
    test('should return test oidc provider response', async () => {
      const { result } = renderHook(
        () =>
          useTestOidcProvider({
            name: 'name',
          }),
        { wrapper },
      );

      const response: TTestOidcProviderResponse = {
        success: true,
        message: 'message',
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: response,
          isLoading: false,
          error: null,
        });
      });
    });
  });

  describe('name is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useTestOidcProvider({ name: undefined }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });

    test('should not fetch when name is null', async () => {
      const { result } = renderHook(() => useTestOidcProvider({ name: null }), {
        wrapper,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
