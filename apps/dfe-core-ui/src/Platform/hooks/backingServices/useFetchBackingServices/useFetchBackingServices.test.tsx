import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchBackingServices } from '.';
import { server } from './useFetchBackingServices.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('useFetchBackingServices', () => {
  it('returns the catalogue with the chart that addresses each overlay', async () => {
    const { result } = renderHook(() => useFetchBackingServices(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.map((entry) => entry.service)).toEqual([
      'clickhouse',
      'kafka',
    ]);
    expect(result.current.data?.[0].chart).toBe('clickhouse-cluster');
    expect(result.current.data?.[0].overlay).toBe('clickhouse-cluster.yaml');
  });

  // Writing a value invalidates the backing-services key, so the list has to be cached under it.
  it('caches the catalogue under the backing-services key, not the sources one', async () => {
    const { result } = renderHook(
      () => ({
        backing: useFetchBackingServices(),
        client: useQueryClient(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.backing.isLoading).toBe(false));

    const { client } = result.current;
    expect(client.getQueryData(QUERY_KEYS.backingServices.default())).toEqual(
      result.current.backing.data,
    );
    expect(client.getQueryData(QUERY_KEYS.sources.default())).toBeUndefined();
  });

  it('reports a values prefix that need not match the service or the chart', async () => {
    const { result } = renderHook(() => useFetchBackingServices(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[0].prefix).toBe('clickhouse');
    expect(result.current.data?.[1].prefix).toBe('kafkaCluster');
    expect(result.current.data?.[1].service).toBe('kafka');
  });

  it('keeps an undeclared value null with a null source', async () => {
    const { result } = renderHook(() => useFetchBackingServices(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[1].replicas).toEqual({
      value: null,
      source: null,
      protected: false,
    });
  });

  it('carries the protected flag on the locked storage values', async () => {
    const { result } = renderHook(() => useFetchBackingServices(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[0].storage_size.protected).toBe(true);
    expect(result.current.data?.[0].storage_class.protected).toBe(true);
    expect(result.current.data?.[0].replicas.protected).toBe(false);
  });
});
