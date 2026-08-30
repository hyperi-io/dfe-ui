import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useUpdateAppScaling } from '.';
import { server } from './useUpdateAppScaling.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const renderUpdate = () =>
  renderHook(
    () => useUpdateAppScaling({ service: 'dfe-receiver', instance: 'default' }),
    { wrapper },
  );

describe('useUpdateAppScaling', () => {
  it('returns the gitops trust signals for the write', async () => {
    const { result } = renderUpdate();

    result.current.mutate({ min_replicas: 2, max_replicas: 8 });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.data).toMatchObject({
      changed: true,
      commit_sha: 'abc1234',
      review_required: false,
      reload: 'roll',
    });
  });

  it('surfaces a rejected dial rather than swallowing it', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.put.error({
        service: 'dfe-receiver',
        instance: 'default',
      }),
    );

    const { result } = renderUpdate();

    result.current.mutate({ min_replicas: 9, max_replicas: 2 });

    await waitFor(() => expect(result.current.error).not.toBeNull());
  });
});
