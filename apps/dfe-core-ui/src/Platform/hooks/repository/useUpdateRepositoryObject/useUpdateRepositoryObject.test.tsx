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
import { useUpdateRepositoryObject } from '.';
import {
  TUpdateRepositoryObjectRequest,
  TUpdateRepositoryObjectResponse,
} from './types';
import { server } from './useUpdateRepositoryObject.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useUpdateRepositoryObject', () => {
  const requestBody: TUpdateRepositoryObjectRequest = undefined;
  const scope = 'scope';
  const scope_id = 'scope_id';
  const namespace = 'namespace';
  const key = 'key';
  describe('onSuccess', () => {
    test('should call onSuccess', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateRepositoryObject({
            scope,
            scope_id,
            namespace,
            key,
            onSuccess,
            onError,
          }),
        { wrapper },
      );

      result.current.mutate(requestBody);

      const expectedResponse: TUpdateRepositoryObjectResponse = {
        scope: 'scope',
        scope_id: 'scope_id',
        namespace: 'namespace',
        key: 'key',
        content_type: 'content_type',
        size: 100,
        updated_by: 'updated_by',
        updated_at: 'updated_at',
        etag: 'etag',
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
      server.use(API_CONFIG_MOCKS.repository.object.put.error());
    });
    test('should call onError', async () => {
      const onSuccess = vi.fn();
      const onError = vi.fn();

      const { result } = renderHook(
        () =>
          useUpdateRepositoryObject({
            scope,
            scope_id,
            namespace,
            key,
            onSuccess,
            onError,
          }),
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
