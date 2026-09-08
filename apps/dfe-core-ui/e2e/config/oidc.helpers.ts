import { APIRequestContext, Page, expect } from '@playwright/test';
import { BASE_URL, ENGINE_API_URL } from './e2e.client';
import { OidcFixture } from './login.helpers';

/** A provider as /api/v1/auth/setup-status names it. */
export type OidcProvider = { name: string; display_name: string };

/** The JSON body the engine's OIDC callback renders into the page. */
export type OidcCallback = {
  access_token: string;
  subject: string;
  email: string;
  groups: string[];
};

// The deployment's own list: the enabled set differs per deploy, so never hardcode one.
export const oidcProviders = async (
  request: APIRequestContext,
): Promise<OidcProvider[]> => {
  const response = await request.get(
    `${ENGINE_API_URL}/api/v1/auth/setup-status`,
  );
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  return (body.oidc_providers ?? []) as OidcProvider[];
};

// The picker is an antd Select whose .ant-select-selector does NOT match on this build.
export const openProviderPicker = async (page: Page) => {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('[role="combobox"]').click();
};

export const chooseProvider = async (page: Page, provider: OidcProvider) => {
  await page
    .locator(`.ant-select-item-option[title="${provider.display_name}"]`)
    .click();
};

// OidcLoginPopup is not a popup: it fetches the login URL, then assigns it in the same tab.
export const clickLogin = async (page: Page) => {
  await page.locator('button:has-text("Login")').click();
};

// fill, never pressSequentially: a stored password carrying a trailing newline submits early.
type SignIn = (page: Page, fixture: OidcFixture) => Promise<void>;

const signInAtDex: SignIn = async (page, fixture) => {
  await page.locator('input[name="login"]').fill(fixture.user);
  await page.locator('input[name="password"]').fill(fixture.password);
  await page.locator('#submit-login').click();
};

const signInAtOkta: SignIn = async (page, fixture) => {
  await page.locator('input[name="identifier"]').fill(fixture.user);
  await page.getByRole('button', { name: 'Next' }).click();
  // Okta calls the password field credentials.passcode; the URL does not change between screens.
  await page
    .locator('input[name="credentials.passcode"]')
    .fill(fixture.password);
  await page.getByRole('button', { name: 'Verify' }).click();
};

/*
 * Only the providers whose sign-in completes end to end.
 *
 * Entra is left out deliberately. Its form is known -- input[name="loginfmt"]
 * then #idSIButton9, then input[name="passwd"] then #idSIButton9, with a decoy
 * visible #i0118 already on the username screen -- but the tenant still forces
 * Authenticator registration after a correct password, with no skip link.
 *
 * Google has no fixture user, and its OAuth client registers no redirect URI for
 * this host, so it answers redirect_uri_mismatch before any sign-in form.
 *
 * Both fall out through the same skip path as a provider with no password.
 */
export const IDP_SIGN_IN: Record<string, SignIn | undefined> = {
  dex: signInAtDex,
  okta: signInAtOkta,
};

// The callback renders the engine's JSON response as the document body.
export const readOidcCallback = async (
  page: Page,
  provider: OidcProvider,
): Promise<OidcCallback> => {
  await page.waitForURL(
    new RegExp(`/api/v1/auth/oidc/${provider.name}/callback`),
  );
  return JSON.parse(await page.locator('body').innerText()) as OidcCallback;
};

// The engine reads Authorization only -- the dfe_token cookie the callback sets is ignored.
export const assertOidcSessionUsable = async (
  request: APIRequestContext,
  callback: OidcCallback,
) => {
  const me = await request.get(`${ENGINE_API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${callback.access_token}` },
  });
  expect(me.status()).toBe(200);
};
