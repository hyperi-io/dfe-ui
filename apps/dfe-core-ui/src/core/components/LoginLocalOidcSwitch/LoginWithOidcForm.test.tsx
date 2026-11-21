import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, waitFor } from '@testing-library/react';
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
  vi,
} from 'vitest';
import { REMEMBER_LABEL, type TLoginChoice } from './loginChoice';
import { LoginWithOidcForm } from './LoginWithOidcForm';

const PROVIDERS = [
  { name: 'corp-sso', display_name: 'Corporate SSO' },
  { name: 'partner-idp', display_name: 'Partner IdP' },
];

const requestedProviders: string[] = [];

// Answers without an authorisation URL, so the form never navigates away.
const server = setupServer(
  http.get(
    API_CONFIG_MOCKS.oidc.login.mockedUrl.replace('{provider}', ':provider'),
    ({ params }) => {
      requestedProviders.push(String(params.provider));
      return HttpResponse.json({ authorization_url: '' });
    },
  ),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery();

// A browser blocking site data throws on reading the property itself, not only on its methods.
const blockStorage = () =>
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  });

const CHOICE_KEY = 'dfe_login_choice';

const remember = (choice: TLoginChoice) =>
  window.localStorage.setItem(CHOICE_KEY, JSON.stringify(choice));

const rememberedChoice = () =>
  JSON.parse(window.localStorage.getItem(CHOICE_KEY) ?? 'null');

const renderForm = () =>
  render(<LoginWithOidcForm oidc_providers={PROVIDERS} />, { wrapper });

const loginRemembering = async () => {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole('checkbox', { name: REMEMBER_LABEL }),
  );
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('LoginWithOidcForm', () => {
  beforeEach(() => {
    requestedProviders.length = 0;
    window.localStorage.clear();
  });

  test.each<{
    when: string;
    stored: TLoginChoice | null;
    title: string;
    ticked: boolean;
  }>([
    {
      when: 'nothing is remembered',
      stored: null,
      title: 'Corporate SSO',
      ticked: false,
    },
    {
      when: 'local sign-in is remembered',
      stored: { method: 'local' },
      title: 'Corporate SSO',
      ticked: false,
    },
    {
      when: 'a configured provider is remembered',
      stored: { method: 'oidc', provider: 'partner-idp' },
      title: 'Partner IdP',
      ticked: true,
    },
    {
      when: 'the remembered provider is no longer configured',
      stored: { method: 'oidc', provider: 'retired-idp' },
      title: 'Corporate SSO',
      ticked: false,
    },
  ])(
    'offers $title with remember ticked $ticked when $when',
    async ({ stored, ticked, title }) => {
      if (stored !== null) {
        remember(stored);
      }

      renderForm();

      expect(await screen.findByTitle(title)).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', {
          name: REMEMBER_LABEL,
          checked: ticked,
        }),
      ).toBeInTheDocument();
    },
  );

  test('forgets the remembered provider when logging in unticked', async () => {
    remember({ method: 'oidc', provider: 'partner-idp' });
    renderForm();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole('checkbox', {
        name: REMEMBER_LABEL,
        checked: true,
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(requestedProviders).toEqual(['partner-idp']));
    expect(rememberedChoice()).toBeNull();
  });

  test('remembers the provider it logs in with', async () => {
    renderForm();

    await loginRemembering();

    await waitFor(() => expect(requestedProviders).toEqual(['corp-sso']));
    expect(rememberedChoice()).toEqual({
      method: 'oidc',
      provider: 'corp-sso',
    });
  });

  test('renders with the first provider when the browser blocks storage', async () => {
    blockStorage();

    renderForm();

    expect(await screen.findByTitle('Corporate SSO')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  test('still starts the login when remembering is asked for and storage is blocked', async () => {
    blockStorage();
    renderForm();

    await loginRemembering();

    await waitFor(() => expect(requestedProviders).toEqual(['corp-sso']));
  });

  test('still starts the login when storage reads but refuses the write', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException(
        'The quota has been exceeded.',
        'QuotaExceededError',
      );
    });
    renderForm();

    await loginRemembering();

    await waitFor(() => expect(requestedProviders).toEqual(['corp-sso']));
  });
});
