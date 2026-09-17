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
            'dfe-core-ui': '1.0.0',
            'dfe-core-api': '1.0.0',
            'dfe-core-db': '1.0.0',
            'dfe-core-auth': '1.0.0',
            'dfe-core-storage': '1.0.0',
            'dfe-core-messaging': '1.0.0',
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
    expect(screen.getByText('ui v1.20.0')).toBeInTheDocument();
    expect(screen.getByText('console v1.6.2')).toBeInTheDocument();
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
            'dfe-core-ui': '1.0.0',
            'dfe-core-api': '1.0.0',
            'dfe-core-db': '1.0.0',
            'dfe-core-auth': '1.0.0',
            'dfe-core-storage': '1.0.0',
            'dfe-core-messaging': '1.0.0',
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
