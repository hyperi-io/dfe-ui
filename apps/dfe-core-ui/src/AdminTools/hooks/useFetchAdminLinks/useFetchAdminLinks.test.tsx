import { ApiError } from '@/core/config/api/client';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchAdminLinks } from '.';
import { server } from './useFetchAdminLinks.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('useFetchAdminLinks', () => {
  it('returns the links in the order the deployer listed them', async () => {
    const { result } = renderHook(() => useFetchAdminLinks(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.map((link) => link.name)).toEqual([
      'Argo CD',
      'Redpanda Console',
      'MinIO Console',
      'OpenBao',
    ]);
    expect(result.current.data?.map((link) => link.status)).toEqual([
      'up',
      'down',
      'up',
      'unknown',
    ]);
  });

  it('returns an empty list as data, not as an error', async () => {
    server.use(
      API_CONFIG_MOCKS.deployment.adminLinks.get.success({
        mockedResponse: [],
      }),
    );

    const { result } = renderHook(() => useFetchAdminLinks(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('surfaces a 403 as an ApiError carrying the status', async () => {
    server.use(API_CONFIG_MOCKS.deployment.adminLinks.get.error());

    const { result } = renderHook(() => useFetchAdminLinks(), { wrapper });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    const { error } = result.current;
    expect(error instanceof ApiError && error.status).toBe(403);
    expect(result.current.data).toBeUndefined();
  });

  it('asks the engine again only when refetch is called', async () => {
    let requests = 0;
    server.events.on('request:start', () => {
      requests += 1;
    });

    const { result } = renderHook(() => useFetchAdminLinks(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(requests).toBe(1);

    await result.current.refetch();

    expect(requests).toBe(2);
    server.events.removeAllListeners();
  });
});
