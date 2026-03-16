import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useCloneSource } from '.';
import { SourceCreateResponse } from '../useCreateSource/types';
import { server } from './useCloneSource.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSourceDetail', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () =>
          useCloneSource({ source_name: 'source', onSuccess, enabled: true }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      result.current.mutate({
        source: 'source',
        display_name: 'display_name',
        enabled: true,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          mutate: expect.any(Function),
          isPending: false,
          error: null,
        });
      });

      const response: SourceCreateResponse = {
        source: 'source',
        message: 'ok',
      };

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(response);
      });
    });
  });

  test('when useFetchSourceDetail fails, should return error', async () => {
    server.use(API_CONFIG_MOCKS.sources.source.get.error());
    const { result } = renderHook(
      () => useCloneSource({ source_name: 'source', enabled: true }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function),
        isPending: false,
        error: {
          message: 'Unable to clone source',
        },
      });
    });
  });
});
