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
import { useFetchGroups } from '.';
import { TGroupsResponse } from './types';
import { server } from './useFetchGroups.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchGroups', () => {
  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useFetchGroups(), { wrapper });

      expect(result.current).toEqual({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: expect.any(Function),
      });

      const expectedResponse: TGroupsResponse = [
        {
          name: 'string',
          description: 'string',
          roles: ['string'],
          members: ['string'],
          scope: 'string',
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
      server.use(API_CONFIG_MOCKS.groups.default.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchGroups(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
