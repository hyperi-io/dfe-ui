import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { render, screen, waitFor, within } from '@testing-library/react';
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
    renderDetails({
      match: { field: 'host', operator: 'equals', value: 'a', negate: false },
    });

    expect(originValue()).toHaveTextContent('Receiver');
  });

  it('keeps the field and value rows for a single condition', () => {
    renderDetails({
      match: { field: 'host', operator: 'equals', value: 'a', negate: false },
    });

    expect(rowValue('Field:')).toHaveTextContent('host');
    expect(rowValue('Value:')).toHaveTextContent('a');
    expect(screen.queryByText('Conditions:')).not.toBeInTheDocument();
  });

  it('reads out grouped conditions one to a line under their join', () => {
    renderDetails({
      match: {
        value: '',
        negate: false,
        all: [
          {
            field: 'data_stream.dataset',
            operator: 'equals',
            value: 'cisco_ios.log',
            negate: false,
          },
          {
            field: 'agent.type',
            operator: 'equals',
            value: 'winlogbeat',
            negate: true,
          },
        ],
      },
    });

    expect(originValue()).toHaveTextContent('Receiver');
    const conditions = rowValue('Conditions:') as HTMLElement;
    expect(conditions).toHaveTextContent(/^All of these/);
    expect(
      within(conditions)
        .getAllByRole('listitem')
        .map((item) => item.textContent),
    ).toEqual([
      'data_stream.dataset equals cisco_ios.log',
      'not agent.type equals winlogbeat',
    ]);
  });

  it('nests a negated any group as none of its parts', () => {
    renderDetails({
      match: {
        value: '',
        negate: false,
        all: [
          {
            field: 'host',
            operator: 'exists',
            value: '',
            negate: false,
          },
          {
            value: '',
            negate: true,
            any: [
              { field: 'a', operator: 'ends_with', value: '1', negate: false },
            ],
          },
        ],
      },
    });

    const conditions = rowValue('Conditions:') as HTMLElement;
    const inner = within(conditions).getByText('None of these');
    expect(inner.nextElementSibling).toHaveTextContent('a ends with 1');
    expect(within(conditions).getByText('host exists')).toBeInTheDocument();
  });

  it('shows the expression of a source matched by CEL Fast', () => {
    renderDetails({ when: "data_stream.dataset == 'okta.system'" });

    expect(originValue()).toHaveTextContent('Receiver');
    expect(rowValue('Expression:')).toHaveTextContent(
      "data_stream.dataset == 'okta.system'",
    );
  });

  it('shows Fetcher for a source with a fetcher', () => {
    renderDetails({
      fetcher: { source_type: 'okta', topic: 'own', config: {} },
    } as Partial<TSourceVersionDetail['version']>);

    expect(originValue()).toHaveTextContent('Fetcher');
  });

  it('shows no header rows for a source that stores no header', () => {
    renderDetails({
      schema: { meta_schema: 'meta/aws/cloudtrail', engine: '' },
    });

    expect(screen.getByText('Meta Schema:')).toBeInTheDocument();
    expect(screen.queryByText('Header Type:')).not.toBeInTheDocument();
    expect(screen.queryByText('Header Version:')).not.toBeInTheDocument();
    expect(screen.queryByText(/\/\.yml/)).not.toBeInTheDocument();
  });

  it.each(['timeseries', 'common-header/timeseries'])(
    'links a %s header to its common-header schema',
    (type) => {
      renderDetails({
        header: { type, version: '1.0.0' },
        schema: { engine: '' },
      });

      const link = screen.getByRole('link', { name: /timeseries/ });
      expect(link).toHaveTextContent(/^common-header\/timeseries\.yml$/);
      expect(link).toHaveAttribute(
        'href',
        '/schemas/other-schemas?schema_path=common-header/timeseries&schema_version=1.0.0',
      );
    },
  );

  it('shows no origin for a core source with neither, such as main', () => {
    renderDetails({ match: null, fetcher: null });

    expect(originValue()).toHaveTextContent('None');
    expect(originValue()).not.toHaveTextContent('Receiver');
  });
});
