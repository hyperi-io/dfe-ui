import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchClientConfig } from '.';
import { TClientConfigResponse } from './types';
import { server } from './useFetchClientConfig.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchClientConfig', () => {
  test('should return client config', async () => {
    const { result } = renderHook(() => useFetchClientConfig(), { wrapper });

    const response: TClientConfigResponse = {
      api_base: 'api_base',
      hyperdx: { enabled: true, url: 'url' },
      auth_mode: 'auth_mode',
      features: { feature: true },
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
