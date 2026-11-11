import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { fireEvent, render, screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { SystemDefaultsSettings } from '.';
import { server } from './SystemDefaultSettings.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const stringDefault = (effective: string) => ({
  effective,
  stored: null,
  origin: 'deployment' as const,
  deployment_default: effective,
});

const defaultsBody = {
  ttl_days: {
    effective: 90,
    stored: null,
    origin: 'deployment' as const,
    deployment_default: 90,
    maximum: 36500,
  },
  common_header_type: stringDefault('timeseries'),
  common_header_version: stringDefault('1.0.3'),
  engine: stringDefault('MergeTree'),
  editable: true,
};

describe('SystemDefaultsSettings', () => {
  it('shows the environment default, with the editor closed', async () => {
    render(<SystemDefaultsSettings />, { wrapper });

    expect(
      await screen.findByText('90 days', {}, { timeout: 15000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Set by DFE_ENGINE_CLICKHOUSE_DEFAULT_TTL_DAYS/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'System defaults actions' }),
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
            maximum: 36500,
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

  it('says the defaults cannot be edited when they failed to load', async () => {
    server.use(API_CONFIG_MOCKS.system.defaults.get.error());
    render(<SystemDefaultsSettings />, { wrapper });

    fireEvent.click(
      await screen.findByRole('button', { name: 'System defaults actions' }),
    );
    fireEvent.click(await screen.findByText('Edit Defaults'));

    expect(
      await screen.findByText(/could not be loaded, so they cannot be edited/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(
      screen.queryByText(/so they cannot be edited/),
    ).not.toBeInTheDocument();
  });

  it('shows the same error notice as the edit form, and no zero values, when the defaults failed', async () => {
    server.use(API_CONFIG_MOCKS.system.defaults.get.error());
    render(<SystemDefaultsSettings />, { wrapper });

    expect(
      await screen.findByText(/The defaults could not be loaded:/),
    ).toBeInTheDocument();
    expect(screen.queryByText('none (kept forever)')).not.toBeInTheDocument();
    expect(screen.queryByText(/@v/)).not.toBeInTheDocument();
  });

  it('says it is loading, and shows no zero values, until the defaults arrive', async () => {
    server.use(
      http.get(API_CONFIG_MOCKS.system.defaults.mockedUrl, async () => {
        await delay(300);
        return HttpResponse.json(defaultsBody);
      }),
    );
    render(<SystemDefaultsSettings />, { wrapper });

    expect(await screen.findByText('Loading defaults...')).toBeInTheDocument();
    expect(screen.queryByText('none (kept forever)')).not.toBeInTheDocument();
    expect(await screen.findByText('90 days')).toBeInTheDocument();
  });
});
