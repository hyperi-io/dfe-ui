import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AppHistoryCard } from '.';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const pool = { service: 'dfe-loader', instance: 'default' };

const changes = (from: number, count: number) =>
  Array.from({ length: count }, (_, offset) => ({
    sha: `sha${from + offset}000000`,
    timestamp: 1756500000 + from + offset,
    actor: 'kaz',
    summary: `change ${from + offset}`,
    state: 'committed',
  }));

describe('AppHistoryCard', () => {
  it('loads the next page as the table scrolls to its end and stops after the last', async () => {
    const tokens: string[] = [];
    server.events.on('request:start', ({ request }) => {
      tokens.push(new URL(request.url).searchParams.get('page_token') ?? '');
    });
    server.use(
      API_CONFIG_MOCKS.apps.history.get.success({
        ...pool,
        pages: [changes(0, 6), changes(6, 2)],
      }),
    );

    const { container } = render(<AppHistoryCard {...pool} />, { wrapper });

    expect(await screen.findByText('change 5')).toBeInTheDocument();
    expect(screen.queryByText('change 6')).not.toBeInTheDocument();

    // jsdom has no layout, so every scroll reads as reaching the end
    const body = container.querySelector('.ant-table-body') as HTMLElement;
    fireEvent.scroll(body);
    expect(await screen.findByText('change 7')).toBeInTheDocument();

    fireEvent.scroll(body);
    await waitFor(() => expect(tokens).toEqual(['', '1']));
  });

  it('shows a change once when a new commit shifts the next page onto it', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.history.get.success({
        ...pool,
        pages: [changes(0, 6), changes(5, 3)],
      }),
    );

    const { container } = render(<AppHistoryCard {...pool} />, { wrapper });

    expect(await screen.findByText('change 5')).toBeInTheDocument();
    const body = container.querySelector('.ant-table-body') as HTMLElement;
    fireEvent.scroll(body);
    expect(await screen.findByText('change 7')).toBeInTheDocument();

    expect(screen.getAllByText('change 5')).toHaveLength(1);
  });

  it('says so when the history cannot be read', async () => {
    server.use(
      http.get(
        `${API_CONFIG_MOCKS.apps.history.mockedUrl}`
          .replace('{service}', pool.service)
          .replace('{instance}', pool.instance),
        () => HttpResponse.json({ detail: 'no deploy repo' }, { status: 503 }),
      ),
    );

    render(<AppHistoryCard {...pool} />, { wrapper });

    expect(
      await screen.findByText('History is not available'),
    ).toBeInTheDocument();
  });
});
