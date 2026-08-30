import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { BackingServices } from '.';
import { server } from './BackingServices.mocks';
import { STORAGE_REMEDY } from './BackingServiceCard';
import { CLICKHOUSE_MEMORY_DOWN_WARNING } from './ResourceField';
import { REPLICA_DECREASE_REASON } from './replicaGuard';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderSection = () => render(<BackingServices />, { wrapper });

describe('BackingServices', () => {
  it('renders one card per service from the API, with no hardcoded list', async () => {
    expect(await renderSection().findByText('clickhouse')).toBeInTheDocument();
    expect(screen.getByText('kafka')).toBeInTheDocument();
  });

  it('shows a third service the engine adds, without a UI change', async () => {
    server.use(
      API_CONFIG_MOCKS.backingServices.default.get.success({
        mockedResponse: [
          {
            service: 'valkey',
            chart: 'valkey',
            overlay: 'valkey.yaml',
            mode: { value: null, source: null, protected: false },
            storage_model: { value: null, source: null, protected: false },
            replicas: { value: 2, source: 'valkey', protected: false },
            storage_size: { value: null, source: null, protected: false },
            storage_class: { value: null, source: null, protected: false },
            resources: {},
          },
        ],
      }),
    );

    expect(await renderSection().findByText('valkey')).toBeInTheDocument();
  });

  it('names the data layer and its never-autoscaled constraint', async () => {
    renderSection();

    expect(await screen.findByText('Backing services')).toBeInTheDocument();
    expect(
      screen.getByText(/never autoscaled/, { exact: false }),
    ).toBeInTheDocument();
  });

  // Rule 3: storage is read-only, and the remedy is the storage model.
  it('renders storage with no editable control and the capacity remedy', async () => {
    renderSection();

    // One per service card, and never as an input.
    expect(await screen.findAllByText('Storage size')).toHaveLength(2);
    expect(screen.getAllByText('Storage class')).toHaveLength(2);
    expect(screen.getAllByText('Storage is read-only')).toHaveLength(2);
    expect(screen.getAllByText(STORAGE_REMEDY)).toHaveLength(2);
    expect(
      screen.queryByLabelText('clickhouse storage size'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('clickhouse storage class'),
    ).not.toBeInTheDocument();
  });

  // Rule 3/4: a locked value says so.
  it('marks the protected values as locked', async () => {
    renderSection();

    await screen.findByText('clickhouse');
    expect(screen.getAllByText('locked').length).toBeGreaterThanOrEqual(4);
  });

  // A null source is a tier default, never a number the UI invents.
  it('renders an undeclared value as the tier default', async () => {
    renderSection();

    await screen.findByText('kafka');
    expect(screen.getAllByText('tier default').length).toBeGreaterThan(0);
  });

  it('says where a declared value came from', async () => {
    renderSection();

    expect(
      await screen.findAllByText('declared in clickhouse-cluster'),
    ).not.toHaveLength(0);
  });

  // Rule 2: the count may go up and never down.
  it('refuses a replica decrease with the reason, and disables the action', async () => {
    const user = userEvent.setup();
    renderSection();

    const input = await screen.findByLabelText('clickhouse replicas');
    await user.clear(input);
    await user.type(input, '2');

    expect(
      await screen.findByText(REPLICA_DECREASE_REASON.clickhouse),
    ).toBeInTheDocument();

    const card = input.closest('div')?.parentElement as HTMLElement;
    expect(
      within(card).getByRole('button', { name: 'Raise count' }),
    ).toBeDisabled();
  });

  it('allows a replica increase', async () => {
    const user = userEvent.setup();
    renderSection();

    const input = await screen.findByLabelText('clickhouse replicas');
    await user.clear(input);
    await user.type(input, '5');

    const card = input.closest('div')?.parentElement as HTMLElement;
    expect(
      within(card).getByRole('button', { name: 'Raise count' }),
    ).toBeEnabled();
    expect(
      screen.queryByText(REPLICA_DECREASE_REASON.clickhouse),
    ).not.toBeInTheDocument();
  });

  // Rule 1: memory-down on ClickHouse warns, and only then.
  it('warns when ClickHouse memory is lowered, and not otherwise', async () => {
    const user = userEvent.setup();
    renderSection();

    const memory = await screen.findByLabelText('clickhouse Memory request');
    await user.clear(memory);
    await user.type(memory, '512Mi');

    expect(
      await screen.findByText(CLICKHOUSE_MEMORY_DOWN_WARNING),
    ).toBeInTheDocument();

    await user.clear(memory);
    await user.type(memory, '16Gi');

    expect(
      screen.queryByText(CLICKHOUSE_MEMORY_DOWN_WARNING),
    ).not.toBeInTheDocument();
  });

  it('does not warn when a CPU dial is lowered', async () => {
    const user = userEvent.setup();
    renderSection();

    const cpu = await screen.findByLabelText('clickhouse CPU request');
    await user.clear(cpu);
    await user.type(cpu, '1');

    expect(
      screen.queryByText(CLICKHOUSE_MEMORY_DOWN_WARNING),
    ).not.toBeInTheDocument();
  });

  it('reports a failure to read rather than showing an empty data layer', async () => {
    server.use(API_CONFIG_MOCKS.backingServices.default.get.error());

    expect(
      await renderSection().findByText('Could not read the backing services'),
    ).toBeInTheDocument();
  });
});
