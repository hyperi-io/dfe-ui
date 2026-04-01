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
import { useTestTransform } from '.';
import { TestTransformRequest, TestTransformResponse } from './types';
import { server } from './useTestTransform.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useTestTransform', () => {
  const requestBody: TestTransformRequest = {
    wasm_base64: 'string',
    records: [
      {
        key: 'string',
        value: 'string',
        timestamp: 0,
        headers: {
          string: 'string',
        },
      },
    ],
    source_format: 'json',
    sink_format: 'json',
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTestTransform({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TestTransformResponse = {
        emitted: [
          {
            key: 'string',
            value: 'string',
            headers: {
              additionalProp1: 'string',
              additionalProp2: 'string',
              additionalProp3: 'string',
            },
          },
        ],
        duration_ms: 0,
        wasm_memory_bytes: 0,
      };

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expectedResponse,
          mutate: expect.any(Function),
          reset: expect.any(Function),
          isPending: false,
          error: null,
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
      server.use(API_CONFIG_MOCKS.transforms.test.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useTestTransform({ onSuccess, onError }),
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
