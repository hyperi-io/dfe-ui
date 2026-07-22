import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRepositoryObjectDetail } from '.';
import { TRepositoryObjectDetailResponse } from './types';
import { server } from './useFetchRepositoryObjectDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRepositoryObjectDetail', () => {
  test('should return repository object detail', async () => {
    const { result } = renderHook(
      () =>
        useFetchRepositoryObjectDetail({
          scope: 'scope',
          scope_id: 'scope_id',
          namespace: 'namespace',
          key: 'key',
        }),
      {
        wrapper,
      },
    );

    const response: TRepositoryObjectDetailResponse = {
      key: 'key',
      content_type: 'content_type',
      size: 100,
      updated_by: 'updated_by',
      updated_at: 'updated_at',
      etag: 'etag',
    };

    await waitFor(() => {
      expect(result.current).toEqual({
        data: response,
        isLoading: false,
        error: null,
      });
    });
  });
});
