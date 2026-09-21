import { Page, expect } from '@playwright/test';
import { BASE_URL } from './e2e.client';

// The password the DEPLOYMENT under test actually has, never the product's own
// constant: sharing that constant made the test type the same wrong value as the
// wizard, so a rotated deployment failed both at once (dfe-ui#206).
// No default -- every deployment mints its own, so a literal here would be wrong.
export const adminPassword = (): string => {
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!password) {
    throw new Error(
      'E2E_ADMIN_PASSWORD is not set: put the admin password this deployment ' +
        'minted into .env.local before running the suite.',
    );
  }
  return password;
};

/** A resolved OIDC fixture login for one provider. */
export type OidcFixture = { user: string; password: string };

const OIDC_FIXTURE_DEFAULT_USER = 'dfe-test@dfe-oidc.test';

// <PROVIDER> is the setup-status provider name uppercased: DEX, OKTA, ENTRA, GOOGLE.
const providerVar = (provider: string, suffix: string): string | undefined =>
  process.env[`DFE_OIDC_${provider.toUpperCase()}_FIXTURE_${suffix}`];

// Resolution order: per-provider override, then the generic pair, then the default.
export const oidcFixtureUser = (provider: string): string =>
  providerVar(provider, 'USER') ||
  process.env.DFE_OIDC_FIXTURE_USER ||
  OIDC_FIXTURE_DEFAULT_USER;

// No default: the shared password is pre-shared into .env.local, never baked in.
export const oidcFixturePassword = (provider: string): string | undefined =>
  providerVar(provider, 'PASSWORD') ||
  process.env.DFE_OIDC_FIXTURE_PASSWORD ||
  undefined;

// Undefined when no password resolves, so the caller skips the provider rather
// than failing a suite that a tester never configured credentials for.
export const oidcFixture = (provider: string): OidcFixture | undefined => {
  const password = oidcFixturePassword(provider);
  return password ? { user: oidcFixtureUser(provider), password } : undefined;
};

/**
 * The console landed on its sources page.
 *
 * /sources redirects to whichever source the console selects by default, so the
 * landing is asserted by path and the query left to the app.
 */
export const expectSourcesLanding = (page: Page) =>
  expect(page).toHaveURL((url) => url.pathname === '/sources');

/**
 * The session ended and the console offered to return where it was.
 *
 * The callback carries whichever sources query the redirect produced, so it is
 * matched by prefix rather than by an encoded literal.
 */
export const expectLoggedOut = (page: Page) =>
  expect(page).toHaveURL(
    (url) =>
      url.pathname === '/login' &&
      (url.searchParams.get('callbackUrl') ?? '').startsWith('/sources'),
  );

export const loginAs = async (page: Page, user: string) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(user);
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(adminPassword());
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expectSourcesLanding(page);
};
