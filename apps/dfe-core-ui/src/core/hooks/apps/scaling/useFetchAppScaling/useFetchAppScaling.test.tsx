import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchAppScaling } from '.';
import { server } from './useFetchAppScaling.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const renderScaling = () =>
  renderHook(
    () => useFetchAppScaling({ service: 'dfe-receiver', instance: 'default' }),
    { wrapper },
  );

describe('useFetchAppScaling', () => {
  it('returns both axes plus the deploy target', async () => {
    const { result } = renderScaling();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toMatchObject({
      supported: true,
      deploy_target: 'kubernetes',
      min_replicas: 1,
      max_replicas: 10,
      cpu_request: '100m',
      memory_limit: '512Mi',
    });
  });

  it('reports an unsupported target with a reason rather than an error', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.unsupported({
        service: 'dfe-receiver',
        instance: 'default',
      }),
    );

    const { result } = renderScaling();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.data?.supported).toBe(false);
    expect(result.current.data?.reason).toContain('KEDA');
  });

  it('keeps an unset dial as null, which is not the same as a value', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.success({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          supported: true,
          reason: '',
          deploy_target: 'kubernetes',
          replica_count: null,
          min_replicas: null,
          max_replicas: null,
          keda_enabled: null,
          cpu_request: null,
          memory_request: null,
          cpu_limit: null,
          memory_limit: null,
        },
      }),
    );

    const { result } = renderScaling();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.cpu_request).toBeNull();
  });
});
