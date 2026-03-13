import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSourceDetail } from '.';
import { server } from './useFetchSourceDetail.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSourceDetail', () => {
  describe('source_name is provided', () => {
    test('should return data', async () => {
      const { result } = renderHook(
        () => useFetchSourceDetail({ source_name: 'source' }),
        { wrapper },
      );

      await waitFor(() => {
        expect(result.current).toEqual({
          data: expect.any(Object),
          isLoading: false,
          error: null,
        });
      });
    });
  });
});
