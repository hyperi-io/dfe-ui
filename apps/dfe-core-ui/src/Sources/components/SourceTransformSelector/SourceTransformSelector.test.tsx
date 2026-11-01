import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { TSourceVersionDetail } from '@/Sources/hooks/useFetchSourceDetail/types';
import { SourceTransformSelector } from '.';
import {
  server,
  SYSLOG_ON_VRL,
  TRANSFORM_APPS_WITH_ELASTIC,
} from './SourceTransformSelector.mocks';

// The deployed instance's own panels are covered where they live; this is about
// the choice above them, and rendering them here would pull in four more calls.
vi.mock(
  '@/Sources/components/ViewSourceTabs/SourceProcessingTabContent/AppInstancePanels',
  () => ({
    AppInstancePanels: () => <div data-testid="instance-panels" />,
  }),
);

// jsdom has no IntersectionObserver, and the catalogue the variant select reads pages on one.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderSelector = (
  onSourceUpdated?: () => void,
  sourceDetail = SYSLOG_ON_VRL,
) =>
  render(
    <SourceTransformSelector
      source="syslog"
      sourceDetail={sourceDetail}
      onSourceUpdated={onSourceUpdated}
    />,
    { wrapper },
  );

/** syslog on vrl, still naming a variant from an earlier move. */
const withStoredVariant = (variant: string): TSourceVersionDetail => ({
  ...SYSLOG_ON_VRL,
  version: {
    ...SYSLOG_ON_VRL.version,
    transform: {
      engine: 'vrl',
      config_file: 'vrl.yaml',
      env: {},
      files: [],
      variant,
    },
  },
});

/** The dialog has heard from the catalogue once its button stops loading. */
const settled = () =>
  waitFor(() =>
    expect(
      screen.getByRole('button', { name: /Switch transform$/ }),
    ).not.toHaveClass('ant-btn-loading'),
  );

const confirmSwitch = async (user: ReturnType<typeof userEvent.setup>) => {
  await settled();
  await user.click(screen.getByRole('button', { name: /Switch transform$/ }));
};

/** Captures the source write, or null when none was made. */
const captureWrite = () => {
  const captured: { body: Record<string, unknown> | null } = { body: null };
  server.use(
    http.put('/api/v1/sources/syslog', async ({ request }) => {
      captured.body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        source: 'syslog',
        message: 'updated',
        current: '2.0.0',
        versions: ['1.0.0', '2.0.0'],
      });
    }),
  );
  return captured;
};

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
    const write = captureWrite();
    const onSourceUpdated = vi.fn();
    renderSelector(onSourceUpdated);

    await user.click(
      await screen.findByRole('radio', { name: /dfe-transform-vector/ }),
    );
    await confirmSwitch(user);

    await waitFor(() => expect(onSourceUpdated).toHaveBeenCalledTimes(1));
    expect(write.body?.transform).toEqual({
      engine: 'vector',
      // vector runs no compiled-in programs, so it takes no variant.
      variant: null,
      config_file: 'vrl.yaml',
      files: [],
    });
    // The whole source is rewritten, so the rest of the definition rides along.
    expect(write.body?.match).toEqual({
      field: 'event.dataset',
      operator: 'equals',
      value: 'syslog',
    });
  });

  it('says the switch awaits review and keeps showing the deployed engine', async () => {
    const user = userEvent.setup();
    server.use(
      http.put('/api/v1/sources/syslog', () =>
        HttpResponse.json({
          source: 'syslog',
          message: 'updated',
          current: '2.0.0',
          versions: ['1.0.0', '2.0.0'],
          review_required: true,
          pr_url: 'https://github.com/acme/deploy/pull/9',
        }),
      ),
    );
    const onSourceUpdated = vi.fn();
    renderSelector(onSourceUpdated);

    await user.click(
      await screen.findByRole('radio', { name: /dfe-transform-vector/ }),
    );
    await confirmSwitch(user);

    expect(
      await screen.findByText('Switch to dfe-transform-vector awaiting review'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Open the review request' }),
    ).toHaveAttribute('href', 'https://github.com/acme/deploy/pull/9');
    expect(onSourceUpdated).not.toHaveBeenCalled();
    expect(
      screen.getByRole('radio', { name: /dfe-transform-vrl/ }),
    ).toBeChecked();
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

  describe('variant', () => {
    const OKTA = 'filebeat.okta.default';

    const switchTo = async (
      user: ReturnType<typeof userEvent.setup>,
      app: RegExp,
    ) => {
      await user.click(await screen.findByRole('radio', { name: app }));
      return screen.findByRole('dialog');
    };

    beforeEach(() => {
      server.use(
        API_CONFIG_MOCKS.apps.default.get.success({
          mockedResponse: TRANSFORM_APPS_WITH_ELASTIC,
        }),
      );
    });

    it('refuses to move a source onto elastic without a variant', async () => {
      const user = userEvent.setup();
      const write = captureWrite();
      const onSourceUpdated = vi.fn();
      renderSelector(onSourceUpdated);

      await switchTo(user, /dfe-transform-elastic/);
      expect(await screen.findByLabelText(/^Variant/)).toBeInTheDocument();
      await confirmSwitch(user);

      expect(
        await screen.findByText('Variant is required'),
      ).toBeInTheDocument();
      expect(write.body).toBeNull();
      expect(onSourceUpdated).not.toHaveBeenCalled();
    });

    it('writes the variant picked from the catalogue', async () => {
      const user = userEvent.setup();
      const write = captureWrite();
      const onSourceUpdated = vi.fn();
      renderSelector(onSourceUpdated);

      await switchTo(user, /dfe-transform-elastic/);
      await user.click(await screen.findByLabelText(/^Variant/));
      await user.click(await screen.findByTitle(`Okta system log (${OKTA})`));
      await confirmSwitch(user);

      await waitFor(() => expect(onSourceUpdated).toHaveBeenCalledTimes(1));
      expect(write.body?.transform).toMatchObject({
        engine: 'elastic',
        variant: OKTA,
      });
    });

    it.each([
      {
        case: 'onto elastic keeps the stored variant',
        app: /dfe-transform-elastic/,
        written: { engine: 'elastic', variant: OKTA },
      },
      {
        case: 'onto vector clears it, vector runs no programs',
        app: /dfe-transform-vector/,
        written: { engine: 'vector', variant: null },
      },
    ])('a switch $case', async ({ app, written }) => {
      const user = userEvent.setup();
      const write = captureWrite();
      const onSourceUpdated = vi.fn();
      renderSelector(onSourceUpdated, withStoredVariant(OKTA));

      const dialog = await switchTo(user, app);
      await settled();
      if (written.variant) {
        expect(dialog).toHaveTextContent(OKTA);
      } else {
        expect(screen.queryByLabelText(/^Variant/)).not.toBeInTheDocument();
      }
      await confirmSwitch(user);

      await waitFor(() => expect(onSourceUpdated).toHaveBeenCalledTimes(1));
      expect(write.body?.transform).toMatchObject(written);
    });

    it('keeps the stored variant and says why when the catalogue cannot be read', async () => {
      const user = userEvent.setup();
      server.use(API_CONFIG_MOCKS.sources.catalogue.get.error({ status: 503 }));
      const write = captureWrite();
      const onSourceUpdated = vi.fn();
      renderSelector(onSourceUpdated, withStoredVariant(OKTA));

      await switchTo(user, /dfe-transform-elastic/);
      expect(
        await screen.findByText(
          'Could not read the source catalogue, so the variant stays as it is',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText(/^Variant/)).not.toBeInTheDocument();
      await confirmSwitch(user);

      await waitFor(() => expect(onSourceUpdated).toHaveBeenCalledTimes(1));
      expect(write.body?.transform).toMatchObject({
        engine: 'elastic',
        variant: OKTA,
      });
    });
  });
});
