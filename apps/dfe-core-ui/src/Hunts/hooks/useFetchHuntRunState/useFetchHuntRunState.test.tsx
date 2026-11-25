import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import type { THuntListItem } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RUN_POLL_MS, runPollInterval, useFetchHuntRunState } from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const item = (name: string, extra: Partial<THuntListItem> = {}) =>
  ({
    name,
    display_name: name,
    source_table: 'main',
    target_table: 'hunts',
    customer: 'acme',
    cron: '*/5 * * * *',
    rules: [],
    running: false,
    too_aggressive: false,
    run_requested: false,
    enabled: true,
    auto_disabled_at: null,
    auto_disabled_reason: '',
    error: '',
    ...extra,
  }) satisfies THuntListItem;

const listing = (items: THuntListItem[]) => {
  const asked: URL[] = [];
  server.use(
    http.get(API_CONFIG_MOCKS.hunts.default.mockedUrl, ({ request }) => {
      asked.push(new URL(request.url));
      return HttpResponse.json(pageOf(items, request));
    }),
  );
  return asked;
};

describe('.useFetchHuntRunState', () => {
  it('returns the hunt whose name matches, not another the search also found', async () => {
    const asked = listing([
      item('audit_extra', { last_run: 1 }),
      item('audit', { last_run: 1_790_516_564, last_run_rows: 12 }),
    ]);

    const { result } = renderHook(
      () => useFetchHuntRunState({ name: 'audit' }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.run?.name).toBe('audit'));
    expect(result.current.run?.last_run).toBe(1_790_516_564);
    expect(result.current.run?.last_run_rows).toBe(12);
    expect(asked.map((url) => url.searchParams.get('search'))).toEqual([
      'audit',
    ]);
    expect(asked[0]?.searchParams.get('page_size')).toBe('1000');
  });

  it('returns null for a hunt the list does not carry', async () => {
    listing([item('other')]);

    const { result } = renderHook(
      () => useFetchHuntRunState({ name: 'audit' }),
      {
        wrapper,
      },
    );

    await waitFor(() => expect(result.current.run).toBeNull());
  });

  it.each([undefined, null, ''])('reads nothing for the name %j', (name) => {
    const { result } = renderHook(() => useFetchHuntRunState({ name }), {
      wrapper,
    });

    expect(result.current.run).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });
});

describe('.runPollInterval', () => {
  it.each([
    { case: 'running', run: { running: true }, wait: RUN_POLL_MS },
    { case: 'queued', run: { run_requested: true }, wait: RUN_POLL_MS },
    {
      case: 'queued and running',
      run: { running: true, run_requested: true },
      wait: RUN_POLL_MS,
    },
    {
      case: 'idle',
      run: { running: false, run_requested: false },
      wait: false,
    },
    { case: 'not found', run: null, wait: false },
    { case: 'not yet read', run: undefined, wait: false },
  ])('is $wait for a hunt that is $case', ({ run, wait }) => {
    expect(runPollInterval(run)).toBe(wait);
  });
});
