import { signedInAs } from '@/core/components/OrgChoiceFormItem/OrgChoiceFormItem.mocks';
import { ADMIN_MOCKED_RESPONSE } from '@/core/components/RbacProtected/hooks/hooks.mocks';
import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { TOrganisation } from '@/core/hooks/useFetchSetupStatus/types';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
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
import { SetupWizard } from '.';

// The group picker reads RBAC and the groups list, and these tests need neither.
vi.mock('@/core/components/AccountGroupSelect', () => ({
  AccountGroupSelect: () => null,
}));

const server = setupServer(
  signedInAs(''),
  API_CONFIG_MOCKS.auth.me.get.success({
    mockedResponse: { ...ADMIN_MOCKED_RESPONSE, external: false },
  }),
  API_CONFIG_MOCKS.accounts.availability.get.success(),
);

const { mockReplace, stepParamRef } = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  stepParamRef: { current: 'welcome' },
}));

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next/navigation')>()),
  useRouter: () => ({ replace: mockReplace, refresh: vi.fn() }),
  useParams: () => ({ step: stepParamRef.current }),
  useSearchParams: () => new URLSearchParams(),
}));

const { wrapper } = buildTestWrapper().withTheme().withReactQuery();

const renderWelcome = (
  firstPendingStep: 'configureOrganisation' | 'configureLogin',
) =>
  render(
    <SetupWizard
      oidcProvider={null}
      organisation={null}
      userCreated={false}
      firstPendingStep={firstPendingStep}
      setupComplete={false}
    />,
    { wrapper },
  );

describe('SetupWizard', () => {
  afterEach(() => {
    mockReplace.mockClear();
    stepParamRef.current = 'welcome';
  });

  test('Next on welcome opens the first step the engine still needs', async () => {
    const user = userEvent.setup();
    renderWelcome('configureLogin');

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureLogin');
  });

  test('Next on welcome opens the organisation step on a fresh deployment', async () => {
    const user = userEvent.setup();
    renderWelcome('configureOrganisation');

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureOrganisation');
  });

  test('Back from the organisation step returns to welcome', async () => {
    const user = userEvent.setup();
    stepParamRef.current = 'configureOrganisation';
    renderWelcome('configureOrganisation');

    await user.click(await screen.findByRole('button', { name: /Back/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/welcome');
  });

  test('the source step renders on its own screen', () => {
    stepParamRef.current = 'configureSource';
    renderWelcome('configureOrganisation');

    expect(
      screen.getByRole('heading', { name: 'Configure Source' }),
    ).toBeInTheDocument();
  });

  test('Next from organisation opens the source step', async () => {
    const user = userEvent.setup();
    stepParamRef.current = 'configureOrganisation';
    render(
      <SetupWizard
        oidcProvider={null}
        organisation={{ name: 'acme' } as TOrganisation}
        userCreated={false}
        firstPendingStep="configureOrganisation"
        setupComplete={false}
      />,
      { wrapper },
    );

    await user.click(await screen.findByRole('button', { name: /Next/ }));

    expect(mockReplace).toHaveBeenCalledWith('/setup/configureSource');
  });

  describe('Create Account', () => {
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    /** The engine refuses a create unless the grant in the header was earned for the username the body creates. */
    const serveEngine = () => {
      const created: Array<{ username: string; grant: string | null }> = [];
      const granted: Array<{ kind: string; target: string }> = [];
      server.use(
        http.post('/api/v1/auth/reauth', async ({ request }) => {
          const body = (await request.json()) as {
            kind: string;
            target: string;
          };
          granted.push({ kind: body.kind, target: body.target });
          return HttpResponse.json({
            expires_in: 600,
            grant: `${body.kind}:${body.target}`,
          });
        }),
        http.post('/api/v1/auth/accounts', async ({ request }) => {
          const body = (await request.json()) as { username: string };
          const grant = request.headers.get('X-DFE-Reauth');
          created.push({ username: body.username, grant });
          if (grant !== `account:${body.username}`) {
            return HttpResponse.json(
              {
                title: 'Forbidden',
                status: 403,
                detail: 'Re-enter your password to make this change',
                code: 'reauth_required',
              },
              { status: 403 },
            );
          }
          return HttpResponse.json(
            { username: body.username },
            { status: 201 },
          );
        }),
      );
      return { created, granted };
    };

    test('asks for the password, and the grant names the account it creates', async () => {
      const user = userEvent.setup();
      const { created, granted } = serveEngine();
      stepParamRef.current = 'configureUser';
      renderWelcome('configureOrganisation');

      await user.type(await screen.findByLabelText(/^Username/), 'first-user');
      await user.type(screen.getByLabelText(/^Email/), 'first@example.com');
      await user.type(screen.getByLabelText(/^Name/), 'First User');
      await user.click(screen.getByLabelText(/^Password/));
      await user.paste('a-long-enough-password');
      await user.click(screen.getByRole('button', { name: 'Create Account' }));

      expect(
        await screen.findByText(
          (_, element) =>
            element?.tagName === 'P' &&
            element.textContent ===
              'You are about to create account first-user.',
        ),
      ).toBeInTheDocument();
      await user.type(
        await screen.findByLabelText('Your password'),
        'the-admin-password',
      );
      await user.click(screen.getByRole('button', { name: 'Confirm' }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledTimes(1);
      });
      expect(granted).toEqual([{ kind: 'account', target: 'first-user' }]);
      expect(created).toEqual([
        { username: 'first-user', grant: 'account:first-user' },
      ]);
      expect(screen.queryByText(/Re-enter your password/)).toBeNull();
    });
  });
});
