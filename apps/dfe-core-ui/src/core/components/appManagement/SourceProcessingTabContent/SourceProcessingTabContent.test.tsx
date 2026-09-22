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
