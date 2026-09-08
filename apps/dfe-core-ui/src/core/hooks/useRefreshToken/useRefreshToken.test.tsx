import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
  vi,
} from 'vitest';
import { useRefreshToken } from '.';
import { TRefreshTokenResponse } from './types';
import { server } from './useRefreshToken.mocks';

const persistRefreshedSessionMock = vi.fn().mockResolvedValue(undefined);

vi.mock('@/core/auth/persistRefreshedSession', () => ({
  persistRefreshedSession: (...args: unknown[]) =>
    persistRefreshedSessionMock(...args),
}));

vi.mock('next-auth/react', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user', accessToken: 'refreshed-token' },
    expires: '2099-01-01',
  }),
}));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  persistRefreshedSessionMock.mockClear();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useRefreshToken', () => {
  describe('onSuccess', () => {
    test('refreshes token and persists session', async () => {
      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      const expectedResponse: TRefreshTokenResponse = {
        access_token: 'refreshed-token',
        token_type: 'bearer',
        expires_in: 3600,
        user_id: 'string',
        roles: ['string'],
        default_credentials: false,
      };

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.data).toEqual(expectedResponse);
      });

      expect(persistRefreshedSessionMock).toHaveBeenCalledWith(
        expectedResponse,
      );
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.auth.refresh.post.error());
    });

    test('should return error', async () => {
      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(persistRefreshedSessionMock).not.toHaveBeenCalled();
    });
  });
});
