import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import type { THuntListItem } from '@/core/hooks/useFetchInfiniteFilteredHunts/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { renderHook, waitFor } from '@testing-library/react';
import type { Query, QueryClient, QueryKey } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import {
  huntPollSecondsKey,
  RUN_POLL_MS,
  runPollInterval,
  useFetchHuntRunState,
} from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

const { wrapper } = buildTestWrapper().withReactQuery();

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

describe('.useFetchHuntRunState polling', () => {
  // The interval the hook handed react-query, called on the query's own state.
  const intervalOf = (client: QueryClient, name: string) => {
    const query = client
      .getQueryCache()
      .find({ queryKey: [...QUERY_KEYS.hunts.hunt({ name }), 'run-state'] });
    if (!query) throw new Error('the run state was not queried');
    const option = query.observers[0]?.options.refetchInterval;
    if (typeof option !== 'function') throw new Error('no interval function');
    return () => option(query as Query<unknown, Error, unknown, QueryKey>);
  };

  const mount = async (name: string) => {
    const builder = buildTestWrapper().withReactQuery();
    const rendered = renderHook(() => useFetchHuntRunState({ name }), {
      wrapper: builder.wrapper,
    });
    await waitFor(() => expect(rendered.result.current.run).toBeTruthy());
    const client = builder.queryClient;
    if (!client) throw new Error('no query client');
    return { client, ...rendered };
  };

  it('polls a queued hunt at the default pace and stops once it is idle', async () => {
    listing([item('audit', { run_requested: true })]);
    const { client } = await mount('audit');
    expect(intervalOf(client, 'audit')()).toBe(RUN_POLL_MS);

    listing([item('audit')]);
    await client.refetchQueries({ queryKey: ['hunts'] });
    expect(intervalOf(client, 'audit')()).toBe(false);
  });

  it("polls at the runner's poll period once a trigger has left it", async () => {
    listing([item('audit', { running: true })]);
    const { client } = await mount('audit');
    client.setQueryData(huntPollSecondsKey('audit'), 12);

    expect(intervalOf(client, 'audit')()).toBe(12_000);
  });

  it('stops polling when a read fails, though the last good data still says running', async () => {
    listing([item('audit', { running: true })]);
    const { client } = await mount('audit');
    expect(intervalOf(client, 'audit')()).toBe(RUN_POLL_MS);

    server.use(API_CONFIG_MOCKS.hunts.default.get.error({ status: 500 }));
    await client.refetchQueries({ queryKey: ['hunts'] });

    expect(intervalOf(client, 'audit')()).toBe(false);
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

describe('.runPollInterval with the runner poll period', () => {
  it.each([
    { seconds: undefined, wait: RUN_POLL_MS },
    { seconds: 0, wait: RUN_POLL_MS },
    { seconds: 0.2, wait: 1000 },
    { seconds: 30, wait: 30_000 },
  ])('is $wait for a poll period of $seconds', ({ seconds, wait }) => {
    expect(runPollInterval({ running: true }, seconds)).toBe(wait);
  });

  it('stays false for an idle hunt however long the period', () => {
    expect(runPollInterval({ running: false }, 30)).toBe(false);
  });
});
