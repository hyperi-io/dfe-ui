import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SuiteVersion } from '.';
import { server } from './SuiteVersion.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  delete process.env.NEXT_PUBLIC_APP_VERSION;
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderSuiteVersion = () => render(<SuiteVersion />, { wrapper });

describe('SuiteVersion', () => {
  // The certified stack is what an operator quotes in support, so it is the
  // one line always on screen; engine, the API's ui pin and the console build
  // actually running are on hover.
  it('shows the stack version, with engine/ui/console on hover', async () => {
    process.env.NEXT_PUBLIC_APP_VERSION = '1.6.2';
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: '2.2.0-rc.13',
          engine: '1.19.12',
          schemas: '1.9.4',
          ui: 'v1.20.0@sha256:abc',
          source: 'deploy-repo',
          python_version: '3.12.12',
          apps: {
            'dfe-ui': 'v1.20.0@sha256:abc',
            'dfe-receiver': '1.4.0',
            'dfe-loader': '1.3.2',
          },
        },
      }),
    );

    const user = userEvent.setup();
    renderSuiteVersion();

    const label = await screen.findByText('2.2.0-rc.13');
    await user.hover(label);

    await waitFor(() => {
      expect(screen.getByText('engine v1.19.12')).toBeInTheDocument();
    });
    expect(screen.getByText('dfe-ui v1.20.0')).toBeInTheDocument();
    expect(screen.getByText('console v1.6.2')).toBeInTheDocument();
  });

  // The engine reports the ui pin in both fields when the deploy repo pins it.
  it.each<{
    name: string;
    apps: Record<string, string>;
    ui?: string | null;
    lines: string[];
    absent: string[];
  }>([
    {
      name: 'names the ui once when the apps map already pins dfe-ui',
      apps: { 'dfe-ui': 'v1.20.0@sha256:abc' },
      lines: ['dfe-ui v1.20.0'],
      absent: ['ui v1.20.0'],
    },
    {
      name: 'keeps the ui line when the apps map does not pin dfe-ui',
      apps: { 'dfe-receiver': '1.4.0' },
      lines: ['ui v1.20.0', 'dfe-receiver v1.4.0'],
      absent: ['dfe-ui v1.20.0'],
    },
    {
      name: 'shows no ui line when nothing pins one and the apps map is empty',
      apps: {},
      lines: ['engine v1.19.12'],
      absent: ['ui v1.20.0', 'dfe-ui v1.20.0'],
      ui: null,
    },
  ])('$name', async ({ apps, lines, absent, ui = 'v1.20.0@sha256:abc' }) => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: '2.2.0-rc.13',
          engine: '1.19.12',
          schemas: '1.9.4',
          ui,
          source: 'deploy-repo',
          python_version: '3.12.12',
          apps,
        },
      }),
    );

    const user = userEvent.setup();
    renderSuiteVersion();
    await user.hover(await screen.findByText('2.2.0-rc.13'));

    for (const line of lines) {
      expect(await screen.findByText(line)).toBeInTheDocument();
    }
    for (const line of absent) {
      expect(screen.queryByText(line)).not.toBeInTheDocument();
    }
  });

  // Without a deploy repo there is no stack to name, so the engine is the answer.
  it('falls back to the engine version when nothing pins a stack', async () => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: null,
          engine: '1.19.12',
          schemas: '1.9.4',
          ui: null,
          source: 'engine',
          python_version: '3.12.12',
          apps: {
            'dfe-ui': 'v1.20.0@sha256:abc',
            'dfe-receiver': '1.4.0',
            'dfe-loader': '1.3.2',
          },
        },
      }),
    );

    renderSuiteVersion();

    expect(await screen.findByText('1.19.12')).toBeInTheDocument();
  });

  it('lists every pinned app in the tooltip when the engine reports them', async () => {
    server.use(
      API_CONFIG_MOCKS.system.version.get.success({
        mockedResponse: {
          stack: '2.2.0-rc.13',
          engine: '1.19.12',
          schemas: '1.9.4',
          ui: null,
          source: 'deploy-repo',
          python_version: '3.12.12',
          apps: { receiver: '1.4.0', loader: '1.3.2' },
        },
      }),
    );

    const user = userEvent.setup();
    renderSuiteVersion();

    const label = await screen.findByText('2.2.0-rc.13');
    await user.hover(label);

    await waitFor(() => {
      expect(screen.getByText('receiver v1.4.0')).toBeInTheDocument();
    });
    expect(screen.getByText('loader v1.3.2')).toBeInTheDocument();
  });
});
