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
import { useUpdateSchema } from '.';
import {
  MetaSchemaUpdateParameters,
  TMetaSchemaUpdateRequestBody,
  TMetaSchemaUpdateResponse,
} from './types';
import { server } from './useUpdateSchema.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateSchema', () => {
  const parameters: MetaSchemaUpdateParameters = {
    schema_path: 'path',
  };
  describe('onSuccess', () => {
    test('should call onSuccess when updating only summary', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateSchema({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        schema: {
          summary: 'string',
        },
        parameters,
      });

      const expectedResponse: TMetaSchemaUpdateResponse = {
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
          reset: expect.any(Function),
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(expectedResponse);
      });

      await waitFor(() => {
        expect(onError).not.toHaveBeenCalled();
      });
    });

    test('should call onSuccess when updating current version', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateSchema({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        schema: {
          current: 'string',
        },
        parameters,
      });

      const expectedResponse: TMetaSchemaUpdateResponse = {
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
          reset: expect.any(Function),
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
    const requestBody: TMetaSchemaUpdateRequestBody = {
      summary: 'string',
    };

    beforeEach(() => {
      server.use(API_CONFIG_MOCKS.schemas.schema.patch.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useUpdateSchema({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate({
        schema: requestBody,
        parameters,
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
