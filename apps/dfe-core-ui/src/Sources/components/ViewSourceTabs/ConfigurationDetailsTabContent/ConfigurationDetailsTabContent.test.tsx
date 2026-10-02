import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { ConfigurationDetailsTabContent } from '.';
import { server } from './ConfigurationDetailsTabContent.mocks';

// AceEditor needs a global `ace` that ClientContext sets.
vi.mock('@/core/components/AceEditor', () => ({
  AceEditor: () => null,
}));

const { wrapper } = buildTestWrapper().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
const renderDetails = (version: Partial<TSourceVersionDetail['version']>) =>
  render(
    <ConfigurationDetailsTabContent
      {...({
        source: 'source',
        selected: '1.0.0',
        deployed_version: '1.0.0',
        version,
      } as TSourceVersionDetail)}
    />,
    { wrapper },
  );

const originValue = () => screen.getByText('Origin:').nextElementSibling;
const rowValue = (term: string) => screen.getByText(term).nextElementSibling;
const header = { type: 'timeseries', version: '1.0.0' };

describe('ConfigurationDetailsTabContent defaults', () => {
  it('shows the DFE default for an engine and TTL the source leaves blank', async () => {
    renderDetails({ header, schema: { engine: '' } });

    await waitFor(() => {
      expect(rowValue('Engine:')).toHaveTextContent('MergeTree (DFE default)');
    });
    expect(rowValue('TTL Days:')).toHaveTextContent('90 (DFE default)');
    expect(screen.queryByText('Override')).not.toBeInTheDocument();
  });

  it('marks an engine and TTL the source sets as overrides', async () => {
    renderDetails({
      header,
      schema: { engine: 'ReplacingMergeTree', ttl_days: 7 },
    });

    await waitFor(() => {
      expect(rowValue('Engine:')).toHaveTextContent(
        'ReplacingMergeTreeOverride',
      );
    });
    expect(rowValue('TTL Days:')).toHaveTextContent('7Override');
  });

  it('shows a TTL of 0 as kept forever', async () => {
    renderDetails({ header, schema: { engine: '', ttl_days: 0 } });

    await waitFor(() => {
      expect(rowValue('TTL Days:')).toHaveTextContent('ForeverOverride');
    });
  });
});

describe('ConfigurationDetailsTabContent', () => {
  it('shows Receiver for a source with a match rule', () => {
    renderDetails({ match: { field: 'host', operator: 'equals', value: 'a' } });

    expect(originValue()).toHaveTextContent('Receiver');
  });

  it('shows Fetcher for a source with a fetcher', () => {
    renderDetails({
      fetcher: { source_type: 'okta', topic: 'own', config: {} },
    } as Partial<TSourceVersionDetail['version']>);

    expect(originValue()).toHaveTextContent('Fetcher');
  });

  it('shows no origin for a core source with neither, such as main', () => {
    renderDetails({ match: null, fetcher: null });

    expect(originValue()).toHaveTextContent('None');
    expect(originValue()).not.toHaveTextContent('Receiver');
  });
});
