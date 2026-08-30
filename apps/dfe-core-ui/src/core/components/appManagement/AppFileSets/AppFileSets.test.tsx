import { TAppFileSet } from '@/core/hooks/apps/instances/useFetchApps/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AppFileSets } from '.';
import { server } from './AppFileSets.mocks';

// Ace needs a real browser; the file-set behaviour under test does not.
vi.mock('@/core/components/AceEditor/AnnotatedAceEditor', () => ({
  AnnotatedAceEditor: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (next: string) => void;
  }) => (
    <textarea
      aria-label="editor"
      value={value ?? ''}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const transforms: TAppFileSet = {
  name: 'transforms',
  language: 'vrl',
  suffixes: ['.vrl'],
  reload: 'roll',
  directory_setting: 'config.transforms.dir',
};

const enrichment: TAppFileSet = {
  name: 'enrichment',
  language: 'data',
  suffixes: ['.csv', '.json'],
  reload: 'roll',
  directory_setting: '',
};

const renderSets = (fileSets: TAppFileSet[]) =>
  render(
    <AppFileSets
      service="dfe-transform-vrl"
      instance="syslog"
      fileSets={fileSets}
    />,
    { wrapper },
  );

describe('AppFileSets', () => {
  it('renders no editor at all for an app that declares no file sets', () => {
    const { container } = renderSets([]);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders one tab per declared set, named by the manifest', async () => {
    renderSets([transforms, enrichment]);

    expect(
      await screen.findByRole('tab', { name: 'transforms' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'enrichment' })).toBeInTheDocument();
  });

  it('skips the tab strip when there is only one set', async () => {
    renderSets([transforms]);

    expect(await screen.findByText('000_parse.vrl')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('states the directory and accepted extensions from the manifest', async () => {
    renderSets([transforms]);

    expect(
      await screen.findByText('Read from config.transforms.dir. Accepts .vrl.'),
    ).toBeInTheDocument();
  });

  it('shows where a linked file came from', async () => {
    renderSets([transforms]);

    expect(await screen.findByText('syslog-parse@stable')).toBeInTheDocument();
  });
});
