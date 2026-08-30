import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ScalingCard } from '.';
import { server } from './ScalingCard.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderCard = () =>
  render(<ScalingCard service="dfe-receiver" instance="default" />, {
    wrapper,
  });

describe('ScalingCard', () => {
  it('shows both axes on one surface', async () => {
    renderCard();

    expect(await screen.findByText('Horizontal')).toBeInTheDocument();
    expect(screen.getByText('Vertical')).toBeInTheDocument();
    expect(screen.getByText('Minimum replicas')).toBeInTheDocument();
    expect(screen.getByText('Maximum replicas')).toBeInTheDocument();
    expect(screen.getByText('CPU request')).toBeInTheDocument();
    expect(screen.getByText('Memory limit')).toBeInTheDocument();
  });

  it('names the deploy target the dials belong to', async () => {
    renderCard();

    expect(
      await screen.findByText('Deploy target: kubernetes'),
    ).toBeInTheDocument();
  });

  // The ScaledObject owns the count while KEDA is on, so the control is dead
  // until it is switched off.
  it('disables the fixed count while KEDA is on', async () => {
    renderCard();

    expect(await screen.findByText('Fixed replica count')).toBeInTheDocument();
    expect(screen.getByLabelText('Fixed replica count')).toBeDisabled();
  });

  it('leaves the fixed count usable when the flag is merely unset', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.success({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          supported: true,
          reason: '',
          deploy_target: 'kubernetes',
          replica_count: null,
          min_replicas: null,
          max_replicas: null,
          keda_enabled: null,
          cpu_request: null,
          memory_request: null,
          cpu_limit: null,
          memory_limit: null,
        },
      }),
    );

    renderCard();

    await waitFor(() =>
      expect(screen.getByLabelText('Fixed replica count')).toBeEnabled(),
    );
  });

  it('enables the fixed count, and the range instead, when KEDA is off', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.kedaOff({
        service: 'dfe-receiver',
        instance: 'default',
      }),
    );

    renderCard();

    await waitFor(() =>
      expect(screen.getByLabelText('Fixed replica count')).toBeEnabled(),
    );
    expect(screen.getByLabelText('Minimum replicas')).toBeDisabled();
    expect(screen.getByLabelText('Maximum replicas')).toBeDisabled();
  });

  // An unset flag is not "off": both engine guards refuse a count unless KEDA
  // is explicitly false, so the count must not depend on the operator having
  // toggled a switch that already looks off.
  it('pairs the count with an explicit keda_enabled false when the flag is unset', async () => {
    const user = userEvent.setup();
    let body: Record<string, unknown> | null = null;
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.success({
        service: 'dfe-receiver',
        instance: 'default',
        mockedResponse: {
          supported: true,
          reason: '',
          deploy_target: 'kubernetes',
          replica_count: null,
          min_replicas: null,
          max_replicas: null,
          keda_enabled: null,
          cpu_request: null,
          memory_request: null,
          cpu_limit: null,
          memory_limit: null,
        },
      }),
      http.put(
        '/api/v1/apps/dfe-receiver/default/scaling',
        async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            changed: true,
            commit_sha: 'abc1234',
            auto_merged: true,
            review_required: false,
            pr_url: null,
            validation: null,
            reload: 'roll',
          });
        },
      ),
    );

    renderCard();

    const count = await screen.findByLabelText('Fixed replica count');
    await waitFor(() => expect(count).toBeEnabled());
    await user.type(count, '2');
    await user.click(screen.getByRole('button', { name: 'Commit dials' }));

    await waitFor(() => expect(body).not.toBeNull());
    expect(body).toMatchObject({ keda_enabled: false, replica_count: 2 });
  });

  it('sends the switch and the count in one request', async () => {
    const user = userEvent.setup();
    let body: Record<string, unknown> | null = null;
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.kedaOff({
        service: 'dfe-receiver',
        instance: 'default',
        replicaCount: null,
      }),
      http.put(
        '/api/v1/apps/dfe-receiver/default/scaling',
        async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({
            changed: true,
            commit_sha: 'abc1234',
            auto_merged: true,
            review_required: false,
            pr_url: null,
            validation: null,
            reload: 'roll',
          });
        },
      ),
    );

    renderCard();

    const count = await screen.findByLabelText('Fixed replica count');
    await waitFor(() => expect(count).toBeEnabled());
    await user.type(count, '4');
    await user.click(screen.getByRole('button', { name: 'Commit dials' }));

    await waitFor(() => expect(body).not.toBeNull());
    expect(body).toMatchObject({ keda_enabled: false, replica_count: 4 });
  });

  it('shows the reason instead of dials when the deploy target refuses', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.scaling.get.unsupported({
        service: 'dfe-receiver',
        instance: 'default',
      }),
    );

    renderCard();

    expect(
      await screen.findByText('Scaling dials do not apply here'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Compose has no KEDA/, { exact: false }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByText('Minimum replicas')).not.toBeInTheDocument();
    });
  });
});
