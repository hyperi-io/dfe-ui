import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { SourceDetailsProvider } from '@/Sources/contexts/SourceDetailsContext';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { render, screen, waitFor } from '@testing-library/react';
import { useSearchParams } from 'next/navigation';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SourceProcessingTabContent } from '.';
import { server } from './SourceProcessingTabContent.mocks';

// Ace needs a real browser; the tab layout under test does not.
vi.mock('@/core/components/AceEditor/AnnotatedAceEditor', () => ({
  AnnotatedAceEditor: () => <textarea aria-label="editor" />,
}));

// The sources list behind the tab pages on one; jsdom has none.
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withListSourcesProvider({})
  .withWrapper(({ children }) => (
    <SourceDetailsProvider>{children}</SourceDetailsProvider>
  ));

const renderTab = () =>
  render(
    <SourceProcessingTabContent
      source="syslog"
      transformSlot={<div data-testid="transform-slot" />}
    />,
    { wrapper },
  );

describe('SourceProcessingTabContent', () => {
  it('puts the receiver routing rule on the source page', async () => {
    renderTab();

    expect(
      await screen.findByRole('heading', { name: 'dfe-receiver routing' }),
    ).toBeInTheDocument();
    // The compiled rule and the deployed one, side by side.
    expect(await screen.findAllByText('event.dataset')).toHaveLength(2);
  });

  it('lifts the transforms into the slot and leaves the fetcher its own card', async () => {
    renderTab();

    expect(await screen.findByTestId('transform-slot')).toBeInTheDocument();
    // A fetcher is per-source too, and deploying one is a real action, so it
    // keeps a card of its own rather than joining the transform choice.
    expect(
      screen.getByRole('heading', { name: 'dfe-fetcher' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('dfe-transform-vrl')).not.toBeInTheDocument();
    expect(screen.queryByText('dfe-transform-elastic')).not.toBeInTheDocument();
  });

  it('offers a deploy only for the per-source app that takes one', async () => {
    renderTab();

    expect(
      await screen.findAllByText('Not deployed for this source.'),
    ).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /Deploy/ })).toHaveLength(1);
  });

  it('excludes the fleet-wide pools from the per-source list', async () => {
    renderTab();

    await screen.findByRole('heading', { name: 'dfe-fetcher' });
    expect(screen.queryByText('Instance default')).not.toBeInTheDocument();
  });
});

const SELECTED = 'seedfetch';

const sourceOn = (origin: 'receiver' | 'fetcher'): TSourceVersionDetail => ({
  source: SELECTED,
  resource_type: 'custom',
  display_name: 'Seed Source',
  description: '',
  enabled: true,
  current: '1.0.0',
  deployed_version: '1.0.0',
  selected: '1.0.0',
  versions: ['1.0.0'],
  state: 'active',
  current_table_topic_type: 'own',
  version: {
    origin,
    date_time: '2026-10-17T00:00:00Z',
    archive: false,
    schema: {
      meta_schema: 'meta/syslog',
      meta_schema_version: '1.0.0',
      engine: '',
    },
    fetcher:
      origin === 'fetcher'
        ? { source_type: 'crates_io', topic: 'own', config: {} }
        : null,
    match:
      origin === 'receiver'
        ? { field: 'tags.collector.type', operator: 'equals', value: SELECTED }
        : null,
  },
});

/** The tab for a selected source that the engine reports on `origin`. */
const renderTabOn = (origin: 'receiver' | 'fetcher') => {
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams({
      source_name: SELECTED,
      source_version: '1.0.0',
    }) as ReturnType<typeof useSearchParams>,
  );
  server.use(
    API_CONFIG_MOCKS.sources.sourceVersion.get.success({
      name: SELECTED,
      version: '1.0.0',
      mockedResponse: sourceOn(origin),
    }),
  );
  return render(
    <SourceProcessingTabContent
      source={SELECTED}
      transformSlot={<div data-testid="transform-slot" />}
    />,
    { wrapper },
  );
};

describe('SourceProcessingTabContent by origin', () => {
  afterEach(() => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams() as ReturnType<typeof useSearchParams>,
    );
  });

  it('shows a fetcher source no receiver routing', async () => {
    renderTabOn('fetcher');

    expect(
      await screen.findByRole('heading', { name: 'dfe-fetcher' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'dfe-receiver routing' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('no rule')).not.toBeInTheDocument();
  });

  it('leads a fetcher source with its fetcher, ahead of the transform', async () => {
    renderTabOn('fetcher');

    const fetcher = await screen.findByRole('heading', { name: 'dfe-fetcher' });
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'dfe-receiver routing' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      fetcher.compareDocumentPosition(screen.getByTestId('transform-slot')) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('keeps the receiver routing on a receiver source and drops the fetcher', async () => {
    renderTabOn('receiver');

    expect(
      await screen.findByRole('heading', { name: 'dfe-receiver routing' }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'dfe-fetcher' }),
      ).not.toBeInTheDocument(),
    );
    expect(screen.getByTestId('transform-slot')).toBeInTheDocument();
  });
});
