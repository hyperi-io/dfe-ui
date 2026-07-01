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
import { useCreateSchema } from '.';
import { SchemaCreateRequest, SchemaCreateResponse } from './types';
import { server } from './useCreateSchema.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateSchema', () => {
  const requestBody: SchemaCreateRequest = {
    current: 'string',
    path: 'path',
    versions: {
      string: {
        date: 'string',
        type: 'string',
        summary: 'string',
        columns: [
          {
            name: 'string',
            type: 'string',
            attribute: ['string'],
            use_case: 'string',
            expr: 'string',
            _field_type: 'base',
          },
        ],
      },
    },
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSchema({ onSuccess, onError, pathPrefix: 'meta' }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: SchemaCreateResponse = {
        path: 'string',
        current: 'string',
        resource_type: 'core',
        versions: {
          string: {
            date: 'string',
            type: 'string',
            summary: 'string',
            columns: [
              {
                name: 'string',
                type: 'string',
                attribute: ['string'],
                use_case: 'string',
                expr: 'string',
                _field_type: 'base',
              },
            ],
          },
        },
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          isPending: false,
          error: null,
          mutate: expect.any(Function),
          data: expectedResponse,
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expectedResponse);
      });

      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
    });
  });

  describe('onError', () => {
    beforeEach(() => {
      server.use(
        API_CONFIG_MOCKS.schemas.schema.post.error({
          schema_path: 'meta/path',
        }),
      );
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSchema({ onSuccess, onError, pathPrefix: 'meta' }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
