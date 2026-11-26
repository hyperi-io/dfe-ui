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
import { EditRoleDrawer } from '.';

// The permission picker reads the scope list, and the save path does not.
vi.mock('@/Settings/components/RoleManagement/RoleScopeSelect', () => ({
  RoleScopeSelect: () => null,
}));

const ROLE = {
  name: 'soc',
  description: 'SOC analyst',
  permissions: ['rules:read'],
  scoped: false,
  resource_type: 'custom',
};
const grants: (string | null)[] = [];

const server = setupServer(
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: ADMIN_MOCKED_RESPONSE,
  }),
  API_CONFIG_MOCKS.auth.reauth.post.success(),
  API_CONFIG_MOCKS.roles.role.get.success({
    mockedResponse: ROLE,
    role_name: ROLE.name,
  }),
  http.put('/api/v1/auth/roles/soc', ({ request }) => {
    const grant = request.headers.get('X-DFE-Reauth');
    grants.push(grant);
    return grant
      ? HttpResponse.json(ROLE)
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

describe('EditRoleDrawer', () => {
  test('opens without a password prompt and asks only when the engine says the save needs it', async () => {
    const user = userEvent.setup();
    render(<EditRoleDrawer role_name="soc" />, { wrapper });

    await user.click(await screen.findByRole('button', { name: 'Edit Role' }));
    const save = await screen.findByRole('button', { name: 'Update Role' });
    expect(screen.queryByLabelText('Your password')).not.toBeInTheDocument();

    await user.click(save);
    await confirmReauth(user);

    await waitFor(() => expect(grants).toHaveLength(2));
    expect(grants[0]).toBeNull();
    expect(grants[1]).toBeTruthy();
  });
});
