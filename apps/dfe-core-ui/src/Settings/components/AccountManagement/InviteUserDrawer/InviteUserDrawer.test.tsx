import {
  listedOrgs,
  MockIntersectionObserver,
  signedInAs,
} from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { confirmReauth } from '@/core/utils/test-utils/confirmReauth';
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
import { InviteUserDrawer } from '.';

vi.mock('@/core/components/AccountGroupSelect', async () => ({
  AccountGroupSelect: (
    await import('@/core/components/AccountGroupSelect/AccountGroupSelect.mocks')
  ).AccountGroupSelectStandIn,
}));
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const grants: (string | null)[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  signedInAs(''),
  listedOrgs,
  API_CONFIG_MOCKS.accounts.availability.get.success(),
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
  http.post(API_CONFIG_MOCKS.accounts.default.mockedUrl, ({ request }) => {
    const grant = request.headers.get('X-DFE-Reauth');
    grants.push(grant);
    return grant
      ? HttpResponse.json({ username: 'new-user' })
      : HttpResponse.json(
          {
            title: 'Forbidden',
            code: 'reauth_required',
            detail: 'Confirm it is you',
          },
          { status: 403 },
        );
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  grants.length = 0;
  server.resetHandlers();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

describe('InviteUserDrawer', () => {
  test('opens without a password prompt and asks only when the engine says the create needs it', async () => {
    const user = userEvent.setup();
    render(<InviteUserDrawer />, { wrapper });

    await user.click(
      await screen.findByRole('button', { name: 'Invite New User' }),
    );
    await user.type(await screen.findByLabelText(/^Username/), 'new-user');
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();
    await user.type(screen.getByLabelText(/^Email/), 'new-user@example.com');
    await user.type(screen.getByLabelText(/^Name/), 'New User');
    await user.click(screen.getByLabelText(/^Password/));
    await user.paste('twelve-chars');
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(
      await screen.findByRole('radio', { name: /^Your organisation/ }),
    );
    await user.click(screen.getByRole('checkbox', { name: 'Choose a group' }));
    await user.click(screen.getByRole('button', { name: 'Create Account' }));
    await confirmReauth(user);

    await waitFor(() => expect(grants).toHaveLength(2));
    expect(grants[0]).toBeNull();
    expect(grants[1]).toBeTruthy();
  });
});
