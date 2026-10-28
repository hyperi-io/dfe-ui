import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchDeployment } from '.';
import { TSystemDeploymentResponse } from './types';
import { server } from './useFetchDeployments.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('.useFetchDeployment', () => {
  test('should return the system deployment details', async () => {
    const { result } = renderHook(() => useFetchDeployment(), { wrapper });

    const response: TSystemDeploymentResponse = {
      profile: 'single-kafka',
      transports: {
        default: 'kafka',
        available: ['kafka', 'grpc'],
        per_source_apps: true,
      },
      mesh: {
        enabled: true,
        namespace: 'default',
      },
      applies_routing: true,
      stack: 'stack',
      engine: 'MergeTree',
      ui: 'ui',
      apps: {
        app1: 'app1',
        app2: 'app2',
      },
      source: 'deployment',
      backing: {
        backing1: {
          managed_by: 'provider',
          provider: 'provider1',
          tier: 'tier1',
          region: 'region1',
        },
        backing2: {
          managed_by: 'dfe',
          provider: 'provider2',
          tier: 'tier2',
          region: 'region2',
        },
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
