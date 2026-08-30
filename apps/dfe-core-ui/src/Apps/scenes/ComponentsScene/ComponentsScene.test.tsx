import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { ComponentsScene } from '.';
import { server } from './ComponentsScene.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('ComponentsScene', () => {
  it('lists the fleet-wide pools and excludes the per-source apps', async () => {
    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByRole('tab', { name: /dfe-receiver/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /dfe-transform-vrl/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: /dfe-transform-elastic/ }),
    ).not.toBeInTheDocument();
  });

  it('shows status, metrics, scaling and history for the selected pool', async () => {
    render(<ComponentsScene />, { wrapper });

    expect(await screen.findByText('Status')).toBeInTheDocument();
    expect(await screen.findByText('Metrics')).toBeInTheDocument();
    expect(await screen.findByText('Scaling')).toBeInTheDocument();
    expect(await screen.findByText('History')).toBeInTheDocument();
    expect(await screen.findByText('reporting')).toBeInTheDocument();
  });

  it('keeps the receiver routing rules off this page', async () => {
    render(<ComponentsScene />, { wrapper });

    await screen.findByText('Status');
    expect(screen.queryByText('Receiver routing')).not.toBeInTheDocument();
  });

  it('says so plainly when nothing is deployed yet', async () => {
    server.use(
      API_CONFIG_MOCKS.apps.default.get.success({ mockedResponse: [] }),
    );

    render(<ComponentsScene />, { wrapper });

    expect(
      await screen.findByText('No components are deployed'),
    ).toBeInTheDocument();
  });
});
