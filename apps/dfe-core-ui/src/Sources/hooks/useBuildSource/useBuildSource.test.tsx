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
} from 'vitest';
import { useBuildSource } from '.';
import { TSourceBuildResponse } from './types';
import { server } from './useBuildSource.mocks';

const { wrapper } = buildTestWrapper().withReactQuery();

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('.useBuildSource', () => {
  const expectedResponse: TSourceBuildResponse = {
    source_name: 'source',
    version: 'string',
    columns: [],
    ddl: {
      source_name: 'source',
      create_table: 'string',
      views: {
        view1: 'string',
        view2: 'string',
      },
    },
  };

  describe('onSuccess', () => {
    test('should return data', async () => {
      const { result } = renderHook(() => useBuildSource(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          reset: expect.any(Function),
        });
      });

      result.current.mutate({
        source_name: 'source',
        source_version: 'string',
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          reset: expect.any(Function),
        });
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.sources.sourceBuild.post.error());
    });
    test('should return error', async () => {
      const { result } = renderHook(() => useBuildSource(), { wrapper });

      await waitFor(() => {
        expect(result.current).toEqual({
          data: undefined,
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          reset: expect.any(Function),
        });
      });

      result.current.mutate({
        source_name: 'source',
        source_version: 'string',
      });

      await waitFor(() => {
        expect(result.current.data).toBeUndefined();
        expect(result.current.isPending).toBe(false);
        expect(result.current.error).toBeTruthy();
        expect(result.current.mutate).toEqual(expect.any(Function));
        expect(result.current.reset).toEqual(expect.any(Function));
      });
    });
  });
});
