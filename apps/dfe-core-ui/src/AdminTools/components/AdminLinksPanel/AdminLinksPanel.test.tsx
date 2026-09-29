import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { AdminLinksPanel } from '.';
import { server } from './AdminLinksPanel.mocks';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  server.events.removeAllListeners();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const rowFor = async (name: string) => {
  const link = await screen.findByRole('link', {
    name: (accessibleName) => accessibleName.startsWith(name),
  });
  const row = link.closest('tr');
  if (!row) throw new Error(`${name} is not in a table row`);
  return row;
};

describe('AdminLinksPanel', () => {
  it('renders one row per link the engine returns, in its order', async () => {
    render(<AdminLinksPanel />, { wrapper });

    const links = await screen.findAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Argo CD(opens in a new tab)',
      'Redpanda Console(opens in a new tab)',
      'MinIO Console(opens in a new tab)',
      'OpenBao(opens in a new tab)',
    ]);
    expect(
      screen.getByText('Sync, diff and roll back the deployed apps'),
    ).toBeInTheDocument();
  });

  it('opens every link in a new tab with no opener and no referrer', async () => {
    render(<AdminLinksPanel />, { wrapper });

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(links[0]).toHaveAttribute('href', 'https://argocd.example.com');
  });

  it('marks each link with the status the engine reported', async () => {
    render(<AdminLinksPanel />, { wrapper });

    expect(within(await rowFor('Argo CD')).getByText('up')).toBeInTheDocument();
    expect(
      within(await rowFor('Redpanda Console')).getByText('down'),
    ).toBeInTheDocument();
    expect(
      within(await rowFor('OpenBao')).getByText('not checked'),
    ).toBeInTheDocument();
  });

  it('says the deployer listed none when the list is empty', async () => {
    server.use(
      API_CONFIG_MOCKS.deployment.adminLinks.get.success({
        mockedResponse: [],
      }),
    );

    render(<AdminLinksPanel />, { wrapper });

    expect(
      await screen.findByText('No admin UIs are listed'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Could not read the admin UIs'),
    ).not.toBeInTheDocument();
  });

  it('shows not permitted, not an error, when the engine answers 403', async () => {
    server.use(API_CONFIG_MOCKS.deployment.adminLinks.get.error());

    render(<AdminLinksPanel />, { wrapper });

    expect(
      await screen.findByText('You do not have sufficient permissions'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Could not read the admin UIs'),
    ).not.toBeInTheDocument();
  });

  it('reports any other failure as an error', async () => {
    server.use(
      API_CONFIG_MOCKS.deployment.adminLinks.get.error({
        mockedResponse: { code: 'internal_error', message: 'engine fell over' },
        status: 500,
      }),
    );

    render(<AdminLinksPanel />, { wrapper });

    expect(
      await screen.findByText('Could not read the admin UIs'),
    ).toBeInTheDocument();
    expect(screen.getByText('engine fell over')).toBeInTheDocument();
  });

  it('asks the engine again only when Refresh is pressed', async () => {
    const user = userEvent.setup();
    let requests = 0;
    server.events.on('request:start', () => {
      requests += 1;
    });

    render(<AdminLinksPanel />, { wrapper });
    await screen.findAllByRole('link');
    expect(requests).toBe(1);

    await user.click(screen.getByRole('button', { name: /Refresh/ }));

    await waitFor(() => expect(requests).toBe(2));
  });
});
