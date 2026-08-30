import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
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
    expect(screen.getAllByText('key_value_set')).toHaveLength(2);
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
          values_path: 'config.routing',
          drift: true,
          absent: false,
          compiled: {
            source_rules: [
              {
                field: 'event.dataset',
                mode: 'key_value_set',
                match_value: 'syslog',
                source: 'syslog',
              },
            ],
          },
          deployed: { source_rules: [] },
        },
      }),
    );

    renderCard();

    expect(await screen.findByText('drift')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sync routing' }),
    ).toBeInTheDocument();
  });

  it('calls out a receiver running on its built-in defaults', async () => {
    server.use(
      routing({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          compiler: 'receiver',
          values_path: 'config.routing',
          drift: true,
          absent: true,
          compiled: { source_rules: [] },
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

  it('renders nothing for a compiler that emits no per-source rules', async () => {
    server.use(
      routing({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          compiler: 'loader',
          values_path: 'config.routing',
          drift: false,
          absent: false,
          compiled: { source_routing: true, source_to_table: {} },
          deployed: { source_routing: true, source_to_table: {} },
        },
      }),
    );

    const { container } = renderCard();

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
