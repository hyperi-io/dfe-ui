import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRepositoryPreferences } from '.';
import { TRepositoryPreferencesResponse } from './types';
import { server } from './useFetchRepositoryPreferences.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRepositoryPreferences', () => {
  test('should return repository preferences', async () => {
    const { result } = renderHook(() => useFetchRepositoryPreferences(), {
      wrapper,
    });

    const response: TRepositoryPreferencesResponse = {
      preferences: {
        key: 'value',
      },
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
