import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { useFetchLibraryArtifacts } from '.';
import { server } from './useFetchLibraryArtifacts.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

describe('useFetchLibraryArtifacts', () => {
  it('returns the artefacts with their tags and labels', async () => {
    const { result } = renderHook(() => useFetchLibraryArtifacts(), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data?.[0]).toMatchObject({
      name: 'syslog-parse',
      kind: 'vrl',
      tags: { stable: 2 },
      labels: { team: 'platform' },
    });
  });

  it('sends every label as its own repeated query parameter', async () => {
    let seen: string[] = [];
    server.use(
      http.get('/api/v1/library', ({ request }) => {
        seen = new URL(request.url).searchParams.getAll('label');
        return HttpResponse.json([]);
      }),
    );

    const { result } = renderHook(
      () =>
        useFetchLibraryArtifacts({
          filters: { label: ['team=platform', 'tier=1'], kind: 'vrl' },
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(seen).toEqual(['team=platform', 'tier=1']);
  });
});
