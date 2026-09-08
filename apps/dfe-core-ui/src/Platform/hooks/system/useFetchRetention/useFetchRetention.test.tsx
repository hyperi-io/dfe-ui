import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchRetention } from '.';
import { TSystemRetentionResponse } from './types';
import { server } from './useFetchRetention.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchRetention', () => {
  test('should return the default retention', async () => {
    const { result } = renderHook(() => useFetchRetention(), { wrapper });

    const response: TSystemRetentionResponse = {
      stored: null,
      effective: 90,
      origin: 'deployment',
      deployment_default: 90,
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
