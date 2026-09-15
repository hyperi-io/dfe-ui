import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchSystemVersion } from '.';
import { TSystemVersionResponse } from './types';
import { server } from './useFetchSystemVersion.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchSystemVersion', () => {
  test('should return system version', async () => {
    const { result } = renderHook(() => useFetchSystemVersion(), { wrapper });

    const response: TSystemVersionResponse = {
      stack: '2.2.0-rc.13',
      engine: '1.19.15',
      ui: null,
      source: 'deploy-repo',
      apps: {},
      python_version: 'python_version',
      apps: {
        'dfe-core-ui': '1.0.0',
        'dfe-core-api': '1.0.0',
        'dfe-core-db': '1.0.0',
        'dfe-core-auth': '1.0.0',
        'dfe-core-storage': '1.0.0',
        'dfe-core-messaging': '1.0.0',
      },
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
