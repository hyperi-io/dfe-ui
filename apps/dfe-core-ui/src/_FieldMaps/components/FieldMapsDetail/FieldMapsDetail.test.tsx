import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { FieldMapsDetail } from '.';

const selection = vi.hoisted(() => ({
  current: { map_standard: 'ecs', map_source: 'winlog' as string | null },
}));

vi.mock('@/core/contexts/ListFieldMapsContext', () => ({
  useListFieldMapsContext: () => ({ selectedFieldMap: selection.current }),
}));

// Ace needs a real browser, and the JSON view starts collapsed.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const server = setupServer(
  API_CONFIG_MOCKS.fieldMaps.source.get.success({
    standard: 'ecs',
    source: 'winlog',
    mockedResponse: {
      standard: 'ecs',
      source: 'winlog',
      version: null,
      description: null,
      inherits: null,
      mappings: {
        'host.name': 'hostname',
        'process.command_line': 'CommandLine',
      },
    },
  }),
  API_CONFIG_MOCKS.fieldMaps.standard.get.success({
    standard: 'cim',
    mockedResponse: {
      standard: 'cim',
      source: null,
      version: '4.0',
      description: 'CIM base map',
      inherits: null,
      mappings: {},
    },
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('FieldMapsDetail', () => {
  it('shows each mapping as a standard field beside its source field', async () => {
    selection.current = { map_standard: 'ecs', map_source: 'winlog' };
    render(<FieldMapsDetail />, { wrapper });

    const table = await screen.findByRole('table');
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Standard field', 'Source field']);
    const commandLine = within(table).getByRole('row', {
      name: 'process.command_line CommandLine',
    });
    expect(commandLine).toBeInTheDocument();
    expect(screen.getByText('winlog')).toBeInTheDocument();
    expect(screen.queryByText(/TODO/)).not.toBeInTheDocument();
  });

  it('names a map with no source as the default for its standard', async () => {
    selection.current = { map_standard: 'cim', map_source: null };
    render(<FieldMapsDetail />, { wrapper });

    expect(
      await screen.findByText('Default map for the standard'),
    ).toBeInTheDocument();
    expect(screen.getByText('CIM base map')).toBeInTheDocument();
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });
});
