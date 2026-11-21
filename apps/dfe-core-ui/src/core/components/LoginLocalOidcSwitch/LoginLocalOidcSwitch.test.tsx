import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { LoginLocalOidcSwitch } from '.';
import { REMEMBER_LABEL, type TLoginChoice } from './loginChoice';

const CHOICE_KEY = 'dfe_login_choice';

const PROVIDERS = [{ name: 'corp-sso', display_name: 'Corporate SSO' }];

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

const remember = (choice: TLoginChoice) =>
  window.localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));

const rememberedChoice = () =>
  JSON.parse(window.localStorage.getItem(CHOICE_KEY) ?? 'null');

const renderSwitch = (oidcProviders = PROVIDERS) => {
  server.use(
    http.get(API_CONFIG_MOCKS.auth.setupStatus.mockedUrl, () =>
      HttpResponse.json({ oidc_providers: oidcProviders }),
    ),
  );
  render(<LoginLocalOidcSwitch callbackUrl="/" />, { wrapper });
};

const localPanel = async () => {
  await userEvent.click(
    await screen.findByRole('tab', { name: 'Login with Local' }),
  );
  return within(screen.getByRole('tabpanel', { name: 'Login with Local' }));
};

const loginLocally = async (panel: ReturnType<typeof within>) => {
  const user = userEvent.setup();
  await user.type(panel.getByLabelText('Username or Email'), 'kaz');
  await user.type(panel.getByLabelText('Password'), 'kaz-password');
  await user.click(panel.getByRole('button', { name: 'Login' }));
};

describe('LoginLocalOidcSwitch', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test.each<{ when: string; stored: TLoginChoice | null; opens: string }>([
    { when: 'nothing is remembered', stored: null, opens: 'Login with OIDC' },
    {
      when: 'a provider is remembered',
      stored: { method: 'oidc', provider: 'corp-sso' },
      opens: 'Login with OIDC',
    },
    {
      when: 'local is remembered',
      stored: { method: 'local' },
      opens: 'Login with Local',
    },
  ])('opens on $opens when $when', async ({ stored, opens }) => {
    if (stored !== null) {
      remember(stored);
    }

    renderSwitch();

    expect(
      await screen.findByRole('tab', { name: opens, selected: true }),
    ).toBeInTheDocument();
  });

  test('ticks the local box when local is remembered', async () => {
    remember({ method: 'local' });
    renderSwitch();

    const panel = await localPanel();

    expect(
      panel.getByRole('checkbox', { name: REMEMBER_LABEL, checked: true }),
    ).toBeInTheDocument();
  });

  test('remembers local when it logs in ticked', async () => {
    renderSwitch();
    const panel = await localPanel();

    await userEvent.click(
      panel.getByRole('checkbox', { name: REMEMBER_LABEL }),
    );
    await loginLocally(panel);

    expect(rememberedChoice()).toEqual({ method: 'local' });
  });

  test('forgets a remembered provider when it logs in locally unticked', async () => {
    remember({ method: 'oidc', provider: 'corp-sso' });
    renderSwitch();
    const panel = await localPanel();

    await loginLocally(panel);

    expect(rememberedChoice()).toBeNull();
  });

  test('offers no remembering when local is the only way in', async () => {
    renderSwitch([]);

    expect(
      await screen.findByLabelText('Username or Email'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('checkbox', { name: REMEMBER_LABEL }),
    ).not.toBeInTheDocument();
  });
});
