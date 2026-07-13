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
import { useCompileTransform } from '.';
import { TCompileTransformRequest, TCompileTransformResponse } from './types';
import { server } from './useCompileTransform.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useCompileTransform', () => {
  const requestBody: TCompileTransformRequest = {
    language: 'rust',
    files: {
      'main.rs': 'fn main() { println!("Hello, world!"); }',
    },
  };
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCompileTransform({ onSuccess, onError }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TCompileTransformResponse = {
        wasm_base64: 'string',
        wasm_bytes: 0,
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
      server.use(API_CONFIG_MOCKS.transforms.compile.post.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () => useCompileTransform({ onSuccess, onError }),
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
