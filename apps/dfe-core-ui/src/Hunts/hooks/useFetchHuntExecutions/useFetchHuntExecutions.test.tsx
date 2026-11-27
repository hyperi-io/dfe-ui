import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { useFetchHuntExecutions } from '.';
import { THuntExecutionsResponse } from './types';
import { server } from './useFetchHuntExecutions.mocks';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: 'error',
  }),
);
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

type TExecution = THuntExecutionsResponse['items'][number];

const execution = (fire: number): TExecution => ({
  execution_id: `name:${fire}`,
  fire,
  status: 'completed',
  rows_returned: 1,
  execution_time_ms: 1000,
  cost_window_minutes: 10,
  cost_estimate: { band: 'unmeasured', window_minutes: 10 },
});

describe('.useFetchHuntExecutions', () => {
  test('returns the first page of executions', async () => {
    const { result } = renderHook(
      () => useFetchHuntExecutions({ name: 'name' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data.map((item) => item.execution_id)).toEqual([
      'execution_id',
    ]);
    expect(result.current.hasNextPage).toBe(false);
  });

  test('follows next_page_token to the next page', async () => {
    const all = [3, 2, 1].map(execution);
    server.use(
      http.get(
        API_CONFIG_MOCKS.hunts.huntExecutions.mockedUrl.replace(
          '{name}',
          'name',
        ),
        ({ request }) => HttpResponse.json(pageOf(all, request)),
      ),
    );

    const { result } = renderHook(
      () => useFetchHuntExecutions({ name: 'name', pageSize: 2 }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.data).toHaveLength(2));
    expect(result.current.hasNextPage).toBe(true);

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.data).toHaveLength(3));
    expect(result.current.data.map((item) => item.fire)).toEqual([3, 2, 1]);
    expect(result.current.hasNextPage).toBe(false);
  });

  test('surfaces a failed read as the error', async () => {
    server.use(
      http.get(
        API_CONFIG_MOCKS.hunts.huntExecutions.mockedUrl.replace(
          '{name}',
          'name',
        ),
        () => HttpResponse.json({ detail: 'down' }, { status: 503 }),
      ),
    );

    const { result } = renderHook(
      () => useFetchHuntExecutions({ name: 'name' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.data).toEqual([]);
  });

  test.each([undefined, null, ''])(
    'does not fetch without a hunt name (%s)',
    async (name) => {
      const { result } = renderHook(() => useFetchHuntExecutions({ name }), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual([]);
      expect(result.current.error).toBeNull();
    },
  );
});
