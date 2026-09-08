import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from 'antd';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { RetentionCard } from '.';
import { server } from './RetentionCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper()
  .withTheme()
  .withReactQuery()
  .withWrapper(({ children }) => <App>{children}</App>);

const overrideHandler = API_CONFIG_MOCKS.system.retention.get.success({
  mockedResponse: {
    stored: 30,
    effective: 30,
    origin: 'override',
    deployment_default: 90,
  },
});

const renderCard = () => render(<RetentionCard />, { wrapper });

describe('RetentionCard', () => {
  it('shows the effective default and that it comes from the deployment', async () => {
    renderCard();

    expect(await screen.findByText('deployment default')).toBeInTheDocument();
    expect(screen.getByText('90 days')).toBeInTheDocument();
    expect(screen.queryByText('Deployment Default')).not.toBeInTheDocument();
  });

  it('shows the deployment default beside an override set here', async () => {
    server.use(overrideHandler);

    renderCard();

    expect(await screen.findByText('override set here')).toBeInTheDocument();
    expect(screen.getByText('30 days')).toBeInTheDocument();
    expect(screen.getByText('Deployment Default')).toBeInTheDocument();
    expect(screen.getByText('90 days')).toBeInTheDocument();
  });

  it('PUTs the edited days on save and names the reconciled tables', async () => {
    const user = userEvent.setup();
    let body: Record<string, unknown> | null = null;
    server.use(
      http.put('/api/v1/system/retention', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          stored: 30,
          effective: 30,
          origin: 'override',
          deployment_default: 90,
          reconcile: {
            summary: '0 database(s) created, 1 table(s) altered',
            tables_altered: ['dfe.main'],
            sources_reconciled: 0,
            sources_skipped: 0,
          },
        });
      }),
    );

    renderCard();

    const days = await screen.findByLabelText(
      'Default retention (days)',
      {},
      { timeout: 15000 },
    );
    await waitFor(() => expect(days).toHaveValue('90'));
    await user.clear(days);
    await user.type(days, '30');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(body).not.toBeNull());
    expect(body).toEqual({ default_ttl_days: 30 });
    expect(
      await screen.findByText('Default retention set to 30 days'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('0 database(s) created, 1 table(s) altered: dfe.main'),
    ).toBeInTheDocument();
  });

  it('PUTs null when the operator returns to the deployment default', async () => {
    const user = userEvent.setup();
    let body: Record<string, unknown> | null = null;
    server.use(
      overrideHandler,
      http.put('/api/v1/system/retention', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          stored: null,
          effective: 90,
          origin: 'deployment',
          deployment_default: 90,
          reconcile: {
            summary: '0 database(s) created, 1 table(s) altered',
            tables_altered: ['dfe.main'],
            sources_reconciled: 0,
            sources_skipped: 0,
          },
        });
      }),
    );

    renderCard();

    const reset = await screen.findByRole(
      'button',
      { name: 'Use deployment default' },
      { timeout: 15000 },
    );
    await waitFor(() => expect(reset).toBeEnabled());
    await user.click(reset);

    await waitFor(() => expect(body).not.toBeNull());
    expect(body).toEqual({ default_ttl_days: null });
  });

  it('disables the reset while the deployment default already applies', async () => {
    renderCard();

    const reset = await screen.findByRole(
      'button',
      { name: 'Use deployment default' },
      { timeout: 15000 },
    );
    expect(reset).toBeDisabled();
  });

  it('shows the engine message on a 502 and says the value is stored', async () => {
    const user = userEvent.setup();
    server.use(API_CONFIG_MOCKS.system.retention.put.reconcileFailed());

    renderCard();

    await user.click(
      await screen.findByRole('button', { name: 'Save' }, { timeout: 15000 }),
    );

    expect(
      await screen.findByText(
        'override stored; ClickHouse reconcile failed: clickhouse down',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'The value is stored and will apply on the next schema apply.',
      ),
    ).toBeInTheDocument();
  });
});
