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
import { useAuthMe } from '.';
import { AuthMe } from './types';
import { server } from './useAuthMe.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useAuthMe', () => {
  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useAuthMe(), { wrapper });

      expect(result.current).toEqual({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: expect.any(Function),
        isError: false,
      });

      const expectedResponse: AuthMe = {
        org_id: 'string',
        user_id: 'string',
        roles: ['string'],
        permissions: ['string'],
        groups: ['string'],
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isLoading: false,
          error: null,
          refetch: expect.any(Function),
          isError: false,
        });
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.auth.me.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useAuthMe(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
