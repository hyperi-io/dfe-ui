import { API_CONFIG_MOCKS } from '@/core/config/api/endpoints/generator';
import { buildTestWrapper } from '@/core/utils/test-utils/buildTestWrapper';
import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { TestOidcProviderResponse } from './TestOidcProviderResponse';

const NAME = 'okta';

const LOGIN_CHECKS = {
  ok: false,
  checks: [
    { name: 'client_id', ok: true, detail: 'client_id set' },
    { name: 'client_secret', ok: false, detail: 'client_secret not set' },
    { name: 'discovery', ok: true, detail: 'discovery reachable' },
  ],
};

const server = setupServer(
  API_CONFIG_MOCKS.oidcProviders.verifyLogin.get.success({
    mockedResponse: LOGIN_CHECKS,
    name: NAME,
  }),
  API_CONFIG_MOCKS.oidcProviders.test.get.success({
    mockedResponse: { success: true, message: 'Directory reachable' },
    name: NAME,
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const { wrapper } = buildTestWrapper().withReactQuery().withTheme();

/** The label and value of each row in *section*'s list. */
const rowsOf = (section: HTMLElement) =>
  Array.from(section.querySelectorAll('dt')).map((term) => [
    term.textContent,
    term.nextElementSibling?.textContent,
  ]);

describe('TestOidcProviderResponse', () => {
  test('each check has its own section, with every sign-in check named as the form names its field', async () => {
    render(<TestOidcProviderResponse oidcProviderName={NAME} />, { wrapper });

    const signIn = await screen.findByRole('region', { name: 'Sign In' });
    expect(await within(signIn).findByText('Failed')).toBeInTheDocument();
    expect(rowsOf(signIn)).toEqual([
      ['Result:', 'Failed'],
      ['Client ID:', 'client_id set'],
      ['Client Secret:', 'client_secret not set'],
      ['Discovery:', 'discovery reachable'],
    ]);

    const directory = screen.getByRole('region', { name: 'Group Directory' });
    expect(await within(directory).findByText('Passed')).toBeInTheDocument();
    expect(rowsOf(directory)).toEqual([
      ['Result:', 'Passed'],
      ['Message:', 'Directory reachable'],
    ]);
  });

  test('a check that cannot run says so in its own section, and the other still reports', async () => {
    server.use(
      http.get(
        API_CONFIG_MOCKS.oidcProviders.verifyLogin.mockedUrl.replace(
          '{name}',
          NAME,
        ),
        () =>
          HttpResponse.json(
            { title: 'Error', code: 'internal', detail: 'engine down' },
            { status: 500 },
          ),
      ),
    );
    render(<TestOidcProviderResponse oidcProviderName={NAME} />, { wrapper });

    const signIn = await screen.findByRole('region', { name: 'Sign In' });
    expect(
      await within(signIn).findByText('Error checking sign in'),
    ).toBeInTheDocument();
    const directory = screen.getByRole('region', { name: 'Group Directory' });
    expect(await within(directory).findByText('Passed')).toBeInTheDocument();
    expect(
      screen.queryByText('Error checking the group directory'),
    ).not.toBeInTheDocument();
  });
});
