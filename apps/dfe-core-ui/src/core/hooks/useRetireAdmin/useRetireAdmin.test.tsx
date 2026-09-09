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
import { useRetireAdmin } from '.';
import { server } from './useRetireAdmin.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useRetireAdmin', () => {
  describe('onSuccess', () => {
    test('should hand back the setup status with the admin retired', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useRetireAdmin({ onSuccess, onError }),
        {
          wrapper,
        },
      );

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.data?.admin_retired).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.data?.retire_admin_available).toBe(false);
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.auth.retireAdmin.post.error());
    });
    test('should call onError when the engine refuses', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useRetireAdmin({ onSuccess, onError }),
        {
          wrapper,
        },
      );

      result.current.mutate();

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
