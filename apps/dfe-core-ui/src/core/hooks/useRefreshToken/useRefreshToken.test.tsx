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
  vi,
} from 'vitest';
import { useRefreshToken } from '.';
import { RefreshTokenResponse } from './types';
import { server } from './useRefreshToken.mocks';

const mockUpdate = vi.fn();

vi.mock('next-auth/react', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { id: 'test-user', accessToken: 'current-token' },
    expires: '2099-01-01',
  }),
  useSession: () => ({ update: mockUpdate }),
}));

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => {
  server.resetHandlers();
  mockUpdate.mockReset();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useRefreshToken', () => {
  describe('onSuccess', () => {
    test('refreshes token and updates session', async () => {
      mockUpdate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRefreshToken(), { wrapper });

      result.current.mutate();

      const expectedResponse: RefreshTokenResponse = {
        access_token: 'refreshed-token',
        token_type: 'bearer',
        expires_in: 3600,
        user_id: 'string',
        roles: ['string'],
      };

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.data).toEqual(expectedResponse);
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        accessToken: 'refreshed-token',
        expiresIn: 3600,
        roles: ['string'],
      });
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

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
