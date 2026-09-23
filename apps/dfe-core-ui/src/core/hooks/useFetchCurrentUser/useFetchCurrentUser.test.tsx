import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { useAuthStore } from '@/core/stores/authStore';
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
import { useFetchCurrentUser } from '.';
import { TCurrentUserResponse } from './types';
import { server } from './useFetchCurrentUser.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useAuthMe', () => {
  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useFetchCurrentUser(), { wrapper });

      expect(result.current).toEqual({
        data: undefined,
        isLoading: true,
        error: null,
        refetch: expect.any(Function),
        isError: false,
      });

      const expectedResponse: TCurrentUserResponse = {
        username: 'string',
        enabled: true,
        blocked: false,
        disabled_at: '',
        blocked_at: '',
        external: false,
        groups: ['string'],
        email: 'string',
        phone: 'string',
        name: 'string',
        created_at: 'string',
        updated_at: 'string',
        external: false,
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
      server.use(API_CONFIG_MOCKS.accounts.me.get.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useFetchCurrentUser(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });
  });
});
