import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useUpdateBackingServiceVar } from '.';
import { server } from './useUpdateBackingServiceVar.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const renderUpdate = () =>
  renderHook(
    () => useUpdateBackingServiceVar({ overlayName: 'clickhouse-cluster' }),
    { wrapper },
  );

describe('useUpdateBackingServiceVar', () => {
  it('addresses the overlay by chart and the value by its full dot-path', async () => {
    const { result } = renderUpdate();

    result.current.mutate({
      path: 'clickhouse.resources.requests.cpu',
      body: { value: '2' },
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(result.current.data).toMatchObject({
      changed: true,
      commit_sha: 'abc1234',
      review_required: false,
    });
  });

  it('surfaces a refusal rather than reporting the write as done', async () => {
    server.use(
      API_CONFIG_MOCKS.backingServices.overlayVar.put.error({
        name: 'clickhouse-cluster',
        path: 'clickhouse.storage.size',
      }),
    );

    const { result } = renderUpdate();

    result.current.mutate({
      path: 'clickhouse.storage.size',
      body: { value: '200Gi' },
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toBeUndefined();
  });
});
