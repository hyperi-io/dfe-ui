import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRepositoryObjects } from '.';
import { TRepositoryObjectsResponse } from './types';
import { server } from './useFetchRepositoryObjects.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRepositoryObjects', () => {
  test('should return repository objects', async () => {
    const { result } = renderHook(
      () =>
        useFetchRepositoryObjects({
          scope: 'scope',
          scope_id: 'scope_id',
          namespace: 'namespace',
        }),
      {
        wrapper,
      },
    );

    const response: TRepositoryObjectsResponse = [
      {
        key: 'key',
        content_type: 'content_type',
        size: 100,
        updated_by: 'updated_by',
        updated_at: 'updated_at',
        etag: 'etag',
      },
    ];

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
