import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { pageOf } from '@/core/utils/test-utils/pageOf';
import { THuntExecutionsResponse } from '@/Hunts/hooks/useFetchHuntExecutions/types';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ExecutionsTab } from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

type TExecution = THuntExecutionsResponse['items'][number];

const FIRE = 1_764_201_600;
const EXECUTIONS_URL = API_CONFIG_MOCKS.hunts.huntExecutions.mockedUrl.replace(
  '{name}',
  'hunt',
);

const completed: TExecution = {
  execution_id: 'hunt:2',
  fire: FIRE,
  status: 'completed',
  rows_returned: 1234,
  execution_time_ms: 2500,
  cost_window_minutes: 60,
  cost_estimate: { estimated_rows: 4000, band: 'ok', window_minutes: 60 },
};

const failed: TExecution = {
  execution_id: 'hunt:1',
  fire: FIRE - 600,
  status: 'failed',
  rows_returned: 0,
  error: 'Code: 241. memory limit',
  execution_time_ms: 120,
  cost_window_minutes: 0,
  cost_estimate: { band: 'unmeasured', window_minutes: 0 },
};

const serve = (all: TExecution[]) =>
  server.use(
    http.get(EXECUTIONS_URL, ({ request }) =>
      HttpResponse.json(pageOf(all, request)),
    ),
  );

const rowOf = (text: string) => {
  const row = screen.getByText(text).closest('tr');
  if (!row) throw new Error(`no row holds ${text}`);
  return within(row);
};

describe('ExecutionsTab', () => {
  it('shows each fire with its status, rows, time, cost and error', async () => {
    serve([completed, failed]);

    render(<ExecutionsTab name="hunt" />, { wrapper });

    await screen.findByText('completed');
    const done = rowOf('completed');
    expect(done.getByText(formatEpochSecondsLocal(FIRE))).toBeInTheDocument();
    expect(done.queryByText(String(FIRE))).not.toBeInTheDocument();
    expect(done.getByText('1,234')).toBeInTheDocument();
    expect(done.getByText('2.5 s')).toBeInTheDocument();
    expect(done.getByText('4,000 rows in 60 min')).toBeInTheDocument();

    const broken = rowOf('failed');
    expect(broken.getByText('Code: 241. memory limit')).toBeInTheDocument();
    expect(broken.getByText('120 ms')).toBeInTheDocument();
    expect(broken.getByText('Not measured')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /load more/i }),
    ).not.toBeInTheDocument();
  });

  it.each([
    { nextPageFails: false, last: 51 },
    { nextPageFails: true, last: 50 },
  ])(
    'loads the next page from next_page_token (next page fails: $nextPageFails)',
    async ({ nextPageFails, last }) => {
      const all = Array.from({ length: 51 }, (_, index) => ({
        ...completed,
        execution_id: `hunt:${index}`,
        fire: FIRE - index * 600,
      }));
      server.use(
        http.get(EXECUTIONS_URL, ({ request }) => {
          const nextPage = new URL(request.url).searchParams.get('page_token');
          return nextPage && nextPageFails
            ? HttpResponse.json({ detail: 'down' }, { status: 503 })
            : HttpResponse.json(pageOf(all, request));
        }),
      );
      const user = userEvent.setup();

      render(<ExecutionsTab name="hunt" />, { wrapper });

      expect(await screen.findAllByText('completed')).toHaveLength(50);
      await user.click(screen.getByRole('button', { name: /load more/i }));

      if (nextPageFails) {
        // The rows already loaded stay, with the retry beside them.
        expect(
          await screen.findByText('The next executions could not be loaded'),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: /retry/i }),
        ).toBeInTheDocument();
      } else {
        expect(
          screen.queryByRole('button', { name: /load more/i }),
        ).not.toBeInTheDocument();
      }
      expect(await screen.findAllByText('completed')).toHaveLength(last);
    },
  );

  it('says so when the hunt has never run', async () => {
    serve([]);

    render(<ExecutionsTab name="hunt" />, { wrapper });

    expect(
      await screen.findByText('No executions found for this hunt'),
    ).toBeInTheDocument();
  });

  it('shows the read error', async () => {
    server.use(
      http.get(EXECUTIONS_URL, () =>
        HttpResponse.json({ detail: 'down' }, { status: 503 }),
      ),
    );

    render(<ExecutionsTab name="hunt" />, { wrapper });

    expect(
      await screen.findByText('Error loading hunt executions'),
    ).toBeInTheDocument();
  });
});
