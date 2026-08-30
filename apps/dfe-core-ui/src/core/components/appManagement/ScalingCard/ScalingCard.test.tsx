import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
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
