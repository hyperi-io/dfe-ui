import { Page, expect } from '@playwright/test';
import { BASE_URL } from './e2e.client';

// Only a dev-posture engine still answers to this; every other posture refuses
// to start on it.
const DEV_POSTURE_PASSWORD = 'changeme';

// The password the DEPLOYMENT under test actually has, which is not necessarily
// the one the app baked in. Importing the product's own constant made the suite
// share the app's assumption: against a deployment whose admin password had been
// rotated, the test typed the same wrong value the wizard did and both failed
// together, so the suite could never catch the mismatch (dfe-ui#206).
// E2E_ADMIN_PASSWORD lets the harness rotate the credential and still log in.
export const adminPassword = (): string =>
  process.env.E2E_ADMIN_PASSWORD || DEV_POSTURE_PASSWORD;

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

export const loginAs = async (page: Page, user: string) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(user);
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(adminPassword());
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/sources`);
};
