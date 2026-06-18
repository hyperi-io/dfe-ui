import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchAccountDetail } from '.';
import { AccountDetail } from './types';
import { server } from './useFetchAccountDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchAccountDetail', () => {
  describe('username is provided', () => {
    test('should return account detail', async () => {
      const { result } = renderHook(
        () =>
          useFetchAccountDetail({
            username: 'string',
          }),
        { wrapper },
      );

      const response: AccountDetail = {
        username: 'string',
        enabled: true,
        groups: ['string'],
        created_at: 'string',
        updated_at: 'string',
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

  describe('username is not provided', () => {
    test('should not fetch and should not return data', async () => {
      const { result } = renderHook(
        () => useFetchAccountDetail({ username: undefined }),
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

    test('should not fetch when username is null', async () => {
      const { result } = renderHook(
        () => useFetchAccountDetail({ username: null }),
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
  });
});
