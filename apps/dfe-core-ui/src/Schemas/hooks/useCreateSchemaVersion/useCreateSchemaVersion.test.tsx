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
import { useCreateSchemaVersion } from '.';
import {
  SchemaCreateVersionRequest,
  SchemaCreateVersionResponse,
} from './types';
import { server } from './useCreateSchemaVersion.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCreateSchemaVersion', () => {
  const requestBody: SchemaCreateVersionRequest = {
    type: 'model',
    columns: [
      {
        name: 'string',
        type: 'string',
        attribute: ['string'],
        use_case: 'string',
        expr: 'string',
      },
    ],
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSchemaVersion({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        schema: requestBody,
        parameters: { schema_path: 'path' },
      });

      const expectedResponse: SchemaCreateVersionResponse = {
        path: 'string',
        current: 'string',
        versions: ['string'],
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
      server.use(API_CONFIG_MOCKS.schemas.schemaVersions.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCreateSchemaVersion({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        schema: requestBody,
        parameters: { schema_path: 'path' },
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(onSuccess).not.toHaveBeenCalled();
      });
    });
  });
});
