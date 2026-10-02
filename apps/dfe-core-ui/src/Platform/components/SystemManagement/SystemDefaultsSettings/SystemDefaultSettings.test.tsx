import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SystemDefaultsSettings } from '.';
import { server } from './SystemDefaultSettings.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('SystemDefaultsSettings', () => {
  it('shows the environment default, with the editor closed', async () => {
    render(<SystemDefaultsSettings />, { wrapper });

    expect(
      await screen.findByText('90 days', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Set by DFE_CLICKHOUSE_DEFAULT_TTL_DAYS/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit retention' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('shows a default of 0 as kept forever', async () => {
    server.use(
      API_CONFIG_MOCKS.system.defaults.get.success({
        mockedResponse: {
          ttl_days: {
            effective: 0,
            stored: null,
            origin: 'deployment',
            deployment_default: 0,
          },
          common_header_type: {
            effective: 'common-header/timeseries',
            stored: 'common-header/timeseries',
            origin: 'deployment',
            deployment_default: 'common-header/timeseries',
          },
          common_header_version: {
            effective: '1.0.1',
            stored: '1.0.1',
            origin: 'deployment',
            deployment_default: '1.0.1',
          },
          engine: {
            effective: 'MergeTree',
            stored: 'MergeTree',
            origin: 'deployment',
            deployment_default: 'MergeTree',
          },
          editable: true,
        },
      }),
    );

    render(<SystemDefaultsSettings />, { wrapper });

    expect(
      await screen.findByText('none (kept forever)', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
  });
});
