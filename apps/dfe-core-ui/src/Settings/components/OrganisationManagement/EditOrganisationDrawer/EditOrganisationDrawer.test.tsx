import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import type { TOrganisationListSummary } from '@/core/hooks/useFetchInfiniteFilteredOrganisations/types';
import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { EditOrganisationDrawer } from '.';

vi.mock('@/core/components/RbacProtected/hooks/useRbac', () => ({
  useRbac: () => ({ isAuthorized: true, isLoading: false, isError: false }),
}));

const REFUSAL =
  "Organisation ID 'test2' already belongs to Acme. An ID can belong to one organisation only.";

const server = setupServer(
  http.put('/api/v1/orgs/globex', () =>
    HttpResponse.json(
      {
        type: 'about:blank',
        title: 'Conflict',
        status: 409,
        detail: REFUSAL,
        code: 'conflict',
        errors: [
          {
            field: 'org_ids',
            location: 'body',
            detail: REFUSAL,
            code: 'org_id_taken',
          },
        ],
      },
      { status: 409 },
    ),
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const GLOBEX = {
  name: 'globex',
  display_name: 'Globex',
  org_ids: ['globex'],
  enabled: true,
  created_at: '',
  updated_at: '',
} as TOrganisationListSummary;

describe('EditOrganisationDrawer', () => {
  test('drops a refusal once the drawer is closed', async () => {
    const user = userEvent.setup();
    render(<EditOrganisationDrawer organisation={GLOBEX} />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Edit Globex' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByText(REFUSAL)).toBeInTheDocument();
    // The engine refuses the clash before it asks for the password.
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Edit Globex' }));

    expect(
      await screen.findByRole('button', { name: 'Save' }),
    ).toBeInTheDocument();
    // The IDs field sits under Advanced Settings once no refusal opens it.
    await user.click(screen.getByRole('button', { name: 'Advanced Settings' }));
    expect(await screen.findByText('Organisation IDs')).toBeVisible();
    // A cleared field error leaves through antd's help animation before it is gone.
    await waitFor(
      () => expect(screen.queryByText(REFUSAL)).not.toBeInTheDocument(),
      { timeout: 5_000 },
    );
  });

  test('asks for the password only when the engine says the change needs it, then retries with the grant', async () => {
    const sent: (string | null)[] = [];
    server.use(
      API_CONFIG_MOCKS.auth.me.get.success({
        mockedResponse: ADMIN_MOCKED_RESPONSE,
      }),
      API_CONFIG_MOCKS.auth.reauth.post.success(),
      http.put('/api/v1/orgs/globex', ({ request }) => {
        const grant = request.headers.get('X-DFE-Reauth');
        sent.push(grant);
        return grant
          ? HttpResponse.json(GLOBEX)
          : HttpResponse.json(
              {
                type: 'about:blank',
                title: 'Forbidden',
                status: 403,
                detail: 'Confirm it is you',
                code: 'reauth_required',
              },
              { status: 403 },
            );
      }),
    );
    const user = userEvent.setup();
    render(<EditOrganisationDrawer organisation={GLOBEX} />, { wrapper });

    await user.click(screen.getByRole('button', { name: 'Edit Globex' }));
    await user.click(await screen.findByRole('button', { name: 'Save' }));
    await confirmReauth(user);

    await waitFor(() => expect(sent).toHaveLength(2));
    expect(sent[0]).toBeNull();
    expect(sent[1]).toBeTruthy();
    expect(screen.queryByText('Confirm it is you')).not.toBeInTheDocument();
  });
});
