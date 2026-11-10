import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ComponentSettings } from '.';
import { server } from './ComponentSettings.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('ComponentSettings', () => {
  it('shows scaling and settings for each fleet-wide component', async () => {
    render(<ComponentSettings />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: 'dfe-receiver', selected: true }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /dfe-transform-vrl/ }),
    ).not.toBeInTheDocument();
    expect(await screen.findByText('Scaling')).toBeInTheDocument();
    expect(await screen.findByText('Settings')).toBeInTheDocument();
  });

  it('gives no tab to an engine process, which has no settings of its own', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({
        mockedResponse: [
          {
            service: 'dfe-engine',
            display_name: null,
            scale_deployed: false,
            multiplicity: 'single',
            has_compiled_routing: false,
            routing_scope: 'stack',
            optional: false,
            offered: true,
            file_sets: [],
            instances: ['default'],
            processes: ['dfe-hunt-runner'],
          },
        ],
      }),
    );

    render(<ComponentSettings />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: 'dfe-engine' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });

  it('says so plainly when nothing is deployed yet', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );

    render(<ComponentSettings />, { wrapper });

    expect(
      await screen.findByText('No components are deployed'),
    ).toBeInTheDocument();
  });
});
