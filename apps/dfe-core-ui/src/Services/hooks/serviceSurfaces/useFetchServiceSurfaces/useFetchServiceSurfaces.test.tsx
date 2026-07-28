import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchServiceSurfaces } from '.';
import { TServiceSurfaceListResponse } from './types';
import { server } from './useFetchServiceSurfaces.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchServiceSurfaces', () => {
  test('should return service surfaces', async () => {
    const { result } = renderHook(() => useFetchServiceSurfaces(), { wrapper });

    const response: TServiceSurfaceListResponse = [
      {
        service: 'string',
        config_count: 0,
        metrics_count: 0,
        manifest_url: 'string',
        description: 'string',
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
