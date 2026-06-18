import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { useFetchAccounts } from '.';
import { Account } from './types';
import { server } from './useFetchAccounts.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchAccounts', () => {
  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useFetchAccounts(), { wrapper });

      expect(result.current).toEqual({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: expect.any(Function),
      });

      const expectedResponse: Account[] = [
        {
          username: 'string',
          enabled: true,
          groups: ['string'],
          created_at: 'string',
          updated_at: 'string',
        },
      ];

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isLoading: false,
          error: null,
          refetch: expect.any(Function),
        });
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.accounts.default.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchAccounts(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
