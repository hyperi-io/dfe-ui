import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useUpdateAppScaling } from '.';
import { server } from './useUpdateAppScaling.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const renderUpdate = (etag?: string | null) =>
  renderHook(
    () =>
      useUpdateAppScaling({
        service: 'dfe-receiver',
        instance: 'default',
        etag,
      }),
    { wrapper },
  );

/** Captures the outgoing If-Match, which no mock factory can assert for us. */
const captureIfMatch = (seen: { value: string | null; sent: boolean }) =>
  http.put('/api/v1/apps/dfe-receiver/default/scaling', ({ request }) => {
    seen.value = request.headers.get('If-Match');
    seen.sent = request.headers.has('If-Match');
    return HttpResponse.json({ changed: true });
  });

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

  it('guards the write with the revision it was given', async () => {
    const seen = { value: null as string | null, sent: false };
    server.use(captureIfMatch(seen));

    const { result } = renderUpdate('aaaaaaa1111');

    result.current.mutate({ min_replicas: 2 });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(seen.value).toBe('aaaaaaa1111');
  });

  // Nothing to be stale against on a repo with no commits yet, so the write has
  // to go unguarded rather than carry a header that matches nothing.
  it('writes unguarded when it holds no revision', async () => {
    const seen = { value: null as string | null, sent: false };
    server.use(captureIfMatch(seen));

    const { result } = renderUpdate(null);

    result.current.mutate({ min_replicas: 2 });

    await waitFor(() => expect(result.current.isPending).toBe(false));

    expect(seen.sent).toBe(false);
  });
});
