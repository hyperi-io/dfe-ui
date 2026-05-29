import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/endpoints.generator.mocks';
import { SchemaCreateResponse } from '@/core/hooks/useCreateSchema/types';
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
import { useCloneSchema } from '.';
import { server } from './useCloneSchema.mocks';

class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
global.IntersectionObserver = MockIntersectionObserver as any;

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const testWrapper = buildTestWrapper().withReactQuery();

describe('.useCloneSchema', () => {
  describe('schema_path and version are provided', () => {
    test('should return data', async () => {
      const onSuccess = vi.fn();
      const { result } = renderHook(
        () =>
          useCloneSchema({
            schema_path: 'source',
            onSuccess,
            version: '1.0.0',
          }),
        { wrapper: testWrapper.wrapper },
      );

      await waitFor(() => {
        expect(testWrapper.queryClient).not.toBeNull();
        const schemaDetailQuery = testWrapper
          .queryClient!.getQueryCache()
          .findAll({ queryKey: ['schema-detail-columns', 'source', '1.0.0'] })
          .at(0);
        expect(schemaDetailQuery?.state.status).toBe('success');
      });

      result.current.mutate({
        path: 'source',
        name: 'display_name',
        version: '1.0.0',
        description: 'description',
      });

      await waitFor(() => {
        expect(result.current).toEqual({
          mutate: expect.any(Function),
          isPending: false,
          error: undefined,
        });
      });

      const response: SchemaCreateResponse = {
        path: 'source',
        current: '1.0.0',
        versions: {
          '1.0.0': {
            date: '2021-01-01',
            type: 'model',
            summary: 'description',
            columns: [
              {
                name: 'string',
                type: 'string',
                attribute: ['string'],
                use_case: 'string',
                expr: 'string',
              },
            ],
          },
        },
      };

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(response);
      });
    });
  });

  test('when useCloneSchema fails, should return error', async () => {
    server.use(
      API_CONFIG_MOCKS.schemas.schemaDetail.get.error({
        schema_path: 'source',
      }),
    );

    const onError = vi.fn();
    const { result } = renderHook(
      () =>
        useCloneSchema({ schema_path: 'source', onError, version: '1.0.0' }),
      { wrapper: testWrapper.wrapper },
    );

    await waitFor(() => {
      expect(result.current).toEqual({
        mutate: expect.any(Function),
        isPending: false,
        error: {
          message: 'Unable to clone schema',
        },
      });
    });
  });
});
