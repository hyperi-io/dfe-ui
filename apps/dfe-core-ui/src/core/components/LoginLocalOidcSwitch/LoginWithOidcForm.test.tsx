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

const renderForm = () =>
  render(<LoginWithOidcForm oidc_providers={PROVIDERS} />, { wrapper });

const loginRemembering = async () => {
  const user = userEvent.setup();
  await user.click(
    await screen.findByRole('checkbox', { name: 'Remember Selected Provider' }),
  );
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('LoginWithOidcForm', () => {
  beforeEach(() => {
    requestedProviders.length = 0;
    window.localStorage.clear();
  });

  test('offers the remembered provider first', async () => {
    window.localStorage.setItem('dfe_provider', 'partner-idp');

    renderForm();

    expect(await screen.findByTitle('Partner IdP')).toBeInTheDocument();
  });

  test('remembers the provider it logs in with', async () => {
    renderForm();

    await loginRemembering();

    await waitFor(() => expect(requestedProviders).toEqual(['corp-sso']));
    expect(window.localStorage.getItem('dfe_provider')).toBe('corp-sso');
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
