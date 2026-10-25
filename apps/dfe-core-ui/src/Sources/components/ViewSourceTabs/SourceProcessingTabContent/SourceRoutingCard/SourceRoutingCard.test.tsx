import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import {
  LOADER_ROUTING_BLOCKS,
  RECEIVER_ROUTING_BLOCKS,
} from '@/core/config/api/endpoints/generator/mocks/apps';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SourceRoutingCard } from '.';
import { server } from './SourceRoutingCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderCard = (source = 'syslog', hasCompiledRouting = true) =>
  render(
    <SourceRoutingCard
      service="dfe-receiver"
      instance="default"
      source={source}
      hasCompiledRouting={hasCompiledRouting}
    />,
    { wrapper },
  );

const routing = API_CONFIG_MOCKS.apps.routing.get.success;

describe('SourceRoutingCard', () => {
  it('shows the source match rule read-only, with no editable field', async () => {
    renderCard();

    // Twice: what the sources compile to, and what the receiver carries.
    expect(await screen.findAllByText('event.dataset')).toHaveLength(2);
    expect(screen.getAllByText('equals')).toHaveLength(2);
    expect(screen.getAllByText('syslog')).toHaveLength(2);
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('reads as synced, with no sync action, when the receiver agrees', async () => {
    renderCard();

    expect(await screen.findByText('synced')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Sync routing' }),
    ).not.toBeInTheDocument();
  });

  it('offers a sync when the deployed rule has drifted from the sources', async () => {
    server.use(
      routing({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          compiler: 'receiver',
          values_paths: { routing: 'config.routing' },
          drift: true,
          absent: false,
          compiled: RECEIVER_ROUTING_BLOCKS,
          deployed: { rules: { rules: [] } },
        },
      }),
    );

    renderCard();

    expect(await screen.findByText('drift')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sync routing' }),
    ).toBeInTheDocument();
  });

  it('shows a grouped match as the tests it holds, and a CEL when as its text', async () => {
    const compiled = {
      rules: {
        rules: [
          {
            id: 'source.grouped',
            match: {
              all: [
                { field: 'host.name', op: 'starts_with', value: 'fw-' },
                { field: 'agent.type', op: 'equals', value: 'x', negate: true },
              ],
            },
            set: { _source: { value: 'grouped' } },
          },
          {
            id: 'source.cel',
            when: "data_stream.dataset == 'okta.system'",
            set: { _source: { value: 'cel' } },
          },
        ],
      },
    };
    server.use(
      routing({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          compiler: 'receiver',
          values_paths: { rules: 'config.rules' },
          drift: false,
          absent: false,
          compiled,
          deployed: compiled,
        },
      }),
    );

    const { unmount } = renderCard('grouped');
    expect(await screen.findAllByText('All of these')).toHaveLength(2);
    expect(screen.getAllByText('host.name')).toHaveLength(2);
    expect(screen.getAllByText('not equals')).toHaveLength(2);
    unmount();

    renderCard('cel');
    expect(
      await screen.findAllByText("data_stream.dataset == 'okta.system'"),
    ).toHaveLength(2);
  });

  it('calls out a receiver running on its built-in defaults', async () => {
    server.use(
      routing({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          compiler: 'receiver',
          values_paths: { routing: 'config.routing' },
          drift: true,
          absent: true,
          compiled: { rules: { rules: [] } },
          deployed: {},
        },
      }),
    );

    renderCard();

    expect(
      await screen.findByText('The receiver carries no routing at all'),
    ).toBeInTheDocument();
  });

  it('renders nothing, and asks nothing, for an app with no compiled routing', async () => {
    // No handler is registered for a second call, so an unasked-for request
    // would fail the suite under onUnhandledRequest: 'error'.
    const { container } = renderCard('syslog', false);

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  // The loader is the true negative: its routing block is a whole-app map, so a
  // source page has nothing to show. Pinned so it is never "fixed" into an
  // empty card.
  it('renders nothing for dfe-loader, whose routing is a whole-app map', async () => {
    server.use(
      routing({
        service: 'dfe-loader',
        instance: 'default',
        mockedResponse: {
          compiler: 'loader',
          values_paths: { routing: 'config.routing' },
          drift: false,
          absent: false,
          compiled: LOADER_ROUTING_BLOCKS,
          deployed: LOADER_ROUTING_BLOCKS,
        },
      }),
    );

    const { container } = render(
      <SourceRoutingCard
        service="dfe-loader"
        instance="default"
        source="syslog"
        hasCompiledRouting
      />,
      { wrapper },
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
