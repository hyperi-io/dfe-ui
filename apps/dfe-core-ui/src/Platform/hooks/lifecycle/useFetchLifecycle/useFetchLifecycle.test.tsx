import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchLifecycle } from '.';
import { TLifecycleResponse } from './types';
import { server } from './useFetchLifecycle.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchLifecycle', () => {
  test('should return lifecycle', async () => {
    const { result } = renderHook(() => useFetchLifecycle(), { wrapper });

    const response: TLifecycleResponse = [
      {
        name: 'string',
        tier: 'string',
        state: 'string',
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
