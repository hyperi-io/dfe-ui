import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { SourceTransformSelector } from '.';
import { server, SYSLOG_ON_VRL } from './SourceTransformSelector.mocks';

// The deployed instance's own panels are covered where they live; this is about
// the choice above them, and rendering them here would pull in four more calls.
vi.mock('@/core/components/appManagement/AppInstancePanels', () => ({
  AppInstancePanels: () => <div data-testid="instance-panels" />,
}));

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderSelector = (onSourceUpdated?: () => void) =>
  render(
    <SourceTransformSelector
      source="syslog"
      sourceDetail={SYSLOG_ON_VRL}
      onSourceUpdated={onSourceUpdated}
    />,
    { wrapper },
  );

describe('SourceTransformSelector', () => {
  it('states the constraint and marks the deployed engine as the choice', async () => {
    renderSelector();

    expect(
      await screen.findByText(/One transform per source/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /dfe-transform-vrl/ }),
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: /dfe-transform-vector/ }),
    ).not.toBeChecked();
    expect(screen.getByTestId('instance-panels')).toBeInTheDocument();
  });

  it('refuses an engine this deployment does not offer, and says why on it', async () => {
    renderSelector();

    const elastic = await screen.findByRole('radio', {
      name: /dfe-transform-elastic/,
    });
    expect(elastic).toBeDisabled();
    expect(
      screen.getByText('This deployment does not offer it in its profile.'),
    ).toBeInTheDocument();
  });

  it('names both ends of the switch before it is made', async () => {
    const user = userEvent.setup();
    renderSelector();

    await user.click(
      await screen.findByRole('radio', { name: /dfe-transform-vector/ }),
    );

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Switch the transform for syslog');
    expect(dialog).toHaveTextContent(
      'dfe-transform-vector takes over from dfe-transform-vrl',
    );
    // Cancelling leaves the source on the engine it had.
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(
        screen.getByRole('radio', { name: /dfe-transform-vrl/ }),
      ).toBeChecked(),
    );
  });

  it('writes the switch to the source, not to the app', async () => {
    const user = userEvent.setup();
    let written: Record<string, unknown> | null = null;
    server.use(
      http.put('/api/v1/sources/syslog', async ({ request }) => {
        written = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          source: 'syslog',
          message: 'updated',
          current: '2.0.0',
          versions: ['1.0.0', '2.0.0'],
        });
      }),
    );
    const onSourceUpdated = vi.fn();
    renderSelector(onSourceUpdated);

    await user.click(
      await screen.findByRole('radio', { name: /dfe-transform-vector/ }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Switch transform' }),
    );

    await waitFor(() => expect(onSourceUpdated).toHaveBeenCalledTimes(1));
    expect(written).not.toBeNull();
    expect(written!.transform).toEqual({
      engine: 'vector',
      // variant names a compiled-in program of one app, so it cannot survive.
      variant: null,
      config_file: 'vrl.yaml',
      files: [],
    });
    // The whole source is rewritten, so the rest of the definition rides along.
    expect(written!.match).toEqual({
      field: 'event.dataset',
      operator: 'equals',
      value: 'syslog',
    });
  });

  it('offers no deploy or undeploy on a transform', async () => {
    renderSelector();

    await screen.findByText('dfe-transform-vrl');
    expect(
      screen.queryByRole('button', { name: /Deploy/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Undeploy/ }),
    ).not.toBeInTheDocument();
  });
});
