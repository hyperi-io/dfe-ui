import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchDefaults } from '.';
import { TSystemDefaultsResponse } from './types';
import { server } from './useFetchDefaults.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchDefaults', () => {
  test('should return the default defaults', async () => {
    const { result } = renderHook(() => useFetchDefaults(), { wrapper });

    const response: TSystemDefaultsResponse = {
      ttl_days: {
        effective: 90,
        stored: null,
        origin: 'deployment',
        deployment_default: 90,
      },
      common_header_type: {
        effective: 'string',
        stored: null,
        origin: 'deployment',
        deployment_default: 'string',
      },
      common_header_version: {
        effective: 'string',
        stored: null,
        origin: 'deployment',
        deployment_default: 'string',
      },
      engine: {
        effective: 'string',
        stored: null,
        origin: 'deployment',
        deployment_default: 'string',
      },
      editable: true,
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
