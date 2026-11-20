import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { act, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { YourOrganisationBanner } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const server = setupServer();
const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('YourOrganisationBanner', () => {
  test('names your organisation and offers to view and edit it', async () => {
    server.use(
      API_CONFIG_MOCKS.system.organisation.get.success(),
      API_CONFIG_MOCKS.orgs.org.get.success({
        org_name: 'acme',
        mockedResponse: {
          name: 'acme',
          display_name: 'Acme',
          org_ids: ['acme'],
          enabled: true,
          created_at: '',
          updated_at: '',
        },
      }),
    );

    render(<YourOrganisationBanner />, { wrapper });

    expect(
      await screen.findByRole('button', { name: 'Edit Acme' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
    expect(screen.getByText('Your organisation')).toBeInTheDocument();
    expect(
      screen.getByText('The organisation running this platform (acme).'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View Acme details' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete Acme' }),
    ).not.toBeInTheDocument();
  });

  test('shows nothing while none is named', async () => {
    const read = vi.fn();
    server.use(
      http.get('/api/v1/system/organisation', () => {
        read();
        return HttpResponse.json({ name: null, display_name: null });
      }),
    );

    const { container } = render(<YourOrganisationBanner />, { wrapper });

    await waitFor(() => expect(read).toHaveBeenCalledTimes(1));
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });

  test('shows nothing to a caller the route refuses', async () => {
    const refused = vi.fn();
    server.use(
      http.get('/api/v1/system/organisation', () => {
        refused();
        return HttpResponse.json(
          { type: 'about:blank', title: 'Forbidden', status: 403 },
          { status: 403 },
        );
      }),
    );

    const { container } = render(<YourOrganisationBanner />, { wrapper });

    await waitFor(() => expect(refused).toHaveBeenCalledTimes(1));
    await act(async () => {});
    expect(container).toBeEmptyDOMElement();
  });
});
