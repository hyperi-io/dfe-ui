import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SourceCreateResponse } from '@/Sources/hooks/useCreateSource/types';
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
import { server } from './useCloneSource.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const testWrapper = buildTestWrapper().withReactQuery();

describe('.useCloneSource', () => {
  const waitForSourceDetail = async (sourceName: string) => {
    await waitFor(() => {
      expect(testWrapper.queryClient).not.toBeNull();
      const detailQuery = testWrapper
        .queryClient!.getQueryCache()
        .findAll({ queryKey: ['source', sourceName] })
        .at(0);
      expect(detailQuery?.state.status).toBe('success');
    });
  };

  describe('source_name is provided', () => {
    test('should return data', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () =>
          useCloneSource({
            source_name: 'source',
            onSuccess,
            source_version: 'string',
            queryEnabled: true,
          }),
        { wrapper: testWrapper.wrapper },
      );

      await waitForSourceDetail('source');

      result.current.mutate({
        source: 'source',
        display_name: 'display_name',
        enabled: true,
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          mutate: expect.any(Function),
          isPending: false,
          error: undefined,
        });
      });

      const response: SourceCreateResponse = {
        source: 'source',
        message: 'ok',
        current: 'string',
        versions: ['string'],
      };

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(response);
      });
    });
  });

  test('when source_version is not provided, should return error', async () => {
    const { result } = renderHook(
      () =>
        useCloneSource({
          source_name: 'source',
          source_version: null,
          queryEnabled: true,
        }),
      { wrapper: testWrapper.wrapper },
    );

    result.current.mutate({
      source: 'source',
      display_name: 'display_name',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current.error?.message).toBe(
        'Unable to clone source - no available version',
      );
    });
  });
  test('when source_version is provided, should return data', async () => {
    const { result } = renderHook(
      () =>
        useCloneSource({
          source_name: 'source',
          source_version: 'string',
          queryEnabled: true,
        }),
      { wrapper: testWrapper.wrapper },
    );

    await waitForSourceDetail('source');

    result.current.mutate({
      source: 'source',
      display_name: 'display_name',
      enabled: true,
    });

    await waitFor(() => {
      expect(result.current.error).toBeUndefined();
    });
  });

  test('when useFetchSourceDetail fails, should return error', async () => {
    server.use(API_CONFIG_MOCKS.sources.source.get.error());
    const { result } = renderHook(
      () =>
        useCloneSource({
          source_name: 'source',
          source_version: 'string',
          queryEnabled: true,
        }),
      { wrapper: testWrapper.wrapper },
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function),
        isPending: false,
        error: undefined,
      });
    });
  });
});
