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
import { SourceProcessingTabContent } from '.';
import { server } from './SourceProcessingTabContent.mocks';

// Ace needs a real browser; the tab layout under test does not.
vi.mock('@/core/components/AceEditor/AnnotatedAceEditor', () => ({
  AnnotatedAceEditor: () => <textarea aria-label="editor" />,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('SourceProcessingTabContent', () => {
  it('puts the receiver routing rule on the source page', async () => {
    render(<SourceProcessingTabContent source="syslog" />, { wrapper });

    expect(
      await screen.findByRole('heading', { name: 'dfe-receiver routing' }),
    ).toBeInTheDocument();
    // The compiled rule and the deployed one, side by side.
    expect(await screen.findAllByText('event.dataset')).toHaveLength(2);
  });

  it('shows every per-source app, deployed or not', async () => {
    render(<SourceProcessingTabContent source="syslog" />, { wrapper });

    expect(await screen.findByText('dfe-transform-vrl')).toBeInTheDocument();
    expect(screen.getByText('dfe-transform-elastic')).toBeInTheDocument();
  });

  it('offers a deploy for an app with no instance for this source', async () => {
    render(<SourceProcessingTabContent source="syslog" />, { wrapper });

    expect(
      await screen.findByText('Not deployed for this source.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Deploy/ })).toBeInTheDocument();
  });

  it('gives an editor only to the app whose manifest declares file sets', async () => {
    render(<SourceProcessingTabContent source="syslog" />, { wrapper });

    expect(await screen.findByText('000_parse.vrl')).toBeInTheDocument();
    expect(screen.getAllByText('Files')).toHaveLength(1);
  });

  it('excludes the fleet-wide pools from the per-source list', async () => {
    render(<SourceProcessingTabContent source="syslog" />, { wrapper });

    await screen.findByText('dfe-transform-vrl');
    expect(screen.queryByText('Instance default')).not.toBeInTheDocument();
  });
});
