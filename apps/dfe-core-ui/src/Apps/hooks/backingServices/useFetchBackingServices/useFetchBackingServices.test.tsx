import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
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
