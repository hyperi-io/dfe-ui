import { Form } from '@/core/components/Form';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TAuthMeResponse } from '@/core/hooks/useAuthMe/types';
import { useAuthStore } from '@/core/stores/authStore';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import { OrgChoiceFormItem } from '.';
import {
  listedOrgs,
  MockIntersectionObserver,
} from './OrgChoiceFormItem.mocks';

const server = setupServer(
  listedOrgs,
  API_CONFIG_MOCKS.system.organisation.get.success({
    mockedResponse: { name: 'hyperi', display_name: 'HyperI' },
  }),
);

beforeAll(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
  useAuthStore.getState().reset();
});
afterAll(() => {
  server.close();
  vi.unstubAllGlobals();
});

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

const authMe = (roles: string[], permissions: string[]) =>
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: {
      org_id: 'acme',
      user_id: 'kim',
      roles,
      permissions,
      groups: [],
      external: false,
      blocked: false,
      disabled_at: '',
      blocked_at: '',
      password_change_required: false,
      hyperdx_role: '',
      hyperdx_identity: '',
    } satisfies TAuthMeResponse,
  });

const renderItem = () =>
  render(
    <Form>
      <OrgChoiceFormItem choices={['own', 'customer']} />
    </Form>,
    { wrapper },
  );

describe('OrgChoiceFormItem', () => {
  test('an org admin gets its own organisation, fixed', async () => {
    server.use(authMe(['org_admin'], ['account:write']));
    renderItem();

    const field = await screen.findByDisplayValue('acme');

    expect(field).toBeDisabled();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  test('an admin of every org picks nothing until it chooses', async () => {
    server.use(authMe(['admin'], ['*']));
    const user = userEvent.setup();
    renderItem();
    await waitFor(() => expect(useAuthStore.getState().me).not.toBeNull());

    const own = await screen.findByRole('radio', {
      name: 'Your organisation (HyperI)',
    });
    const customer = screen.getByRole('radio', {
      name: 'Customer organisation',
    });

    expect([own, customer].some((radio) => radio.matches(':checked'))).toBe(
      false,
    );
    expect(
      screen.queryByRole('combobox', { name: 'Organisation name' }),
    ).not.toBeInTheDocument();
    await user.click(customer);
    expect(
      await screen.findByRole('combobox', { name: 'Organisation name' }),
    ).toBeInTheDocument();
  });
});
