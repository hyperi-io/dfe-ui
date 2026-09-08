import { APIRequestContext, Page, expect } from '@playwright/test';
import { BASE_URL, ENGINE_API_URL } from './e2e.client';
import { OidcFixture } from './login.helpers';

/** A provider as /api/v1/auth/setup-status names it. */
export type OidcProvider = { name: string; display_name: string };

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

// Entra keeps a hidden password input on the username screen, so the visible
// one is the target, and its scripts drop keystrokes until they settle.
const signInAtEntra: SignIn = async (page, fixture) => {
  await page.locator('input[name="loginfmt"]').fill(fixture.user);
  await page.locator('#idSIButton9').click();
  const password = page.locator('input[name="passwd"]:visible');
  await password.waitFor();
  await page.waitForTimeout(6000);
  await password.click();
  await page.keyboard.type(fixture.password, { delay: 60 });
  await page.keyboard.press('Enter');
  // "Stay signed in?" -- either answer completes the login.
  await page.locator('#idSIButton9').click();
};

const signInAtGoogle: SignIn = async (page, fixture) => {
  await page.locator('input[name="identifier"]').fill(fixture.user);
  await page.locator('#identifierNext button').click();
  await page.locator('input[name="Passwd"]').fill(fixture.password);
  await page.locator('#passwordNext button').click();
  // A Workspace account's first login shows the terms page once.
  const terms = page.locator('button:has-text("I understand")');
  if (await terms.isVisible({ timeout: 5000 }).catch(() => false)) {
    await terms.click();
  }
};

// Provider name as setup-status reports it: the engine routes on this name.
export const IDP_SIGN_IN: Record<string, SignIn | undefined> = {
  dex: signInAtDex,
  okta: signInAtOkta,
  entra: signInAtEntra,
  'google-workspace': signInAtGoogle,
};

/** The NextAuth session the console holds after the OIDC hand-back. */
export type ConsoleSession = {
  user?: { name?: string; accessToken?: string; roles?: string[] };
  error?: string;
};

// The engine's callback 303s to /login/oidc, which signs in and leaves for callbackUrl.
export const assertConsoleSession = async (
  page: Page,
): Promise<ConsoleSession> => {
  await page.waitForURL(
    (url) =>
      url.origin === new URL(BASE_URL).origin &&
      !url.pathname.startsWith('/login'),
    { timeout: 60000 },
  );
  const response = await page.request.get(`${BASE_URL}/api/auth/session`);
  expect(response.ok()).toBeTruthy();
  const session = (await response.json()) as ConsoleSession;
  expect(session.user?.accessToken).toBeTruthy();
  expect(session.error).toBeUndefined();
  return session;
};

// The engine reads Authorization only, so the session's token is what proves it.
export const assertOidcSessionUsable = async (
  request: APIRequestContext,
  session: ConsoleSession,
) => {
  const me = await request.get(`${ENGINE_API_URL}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${session.user?.accessToken}` },
  });
  expect(me.status()).toBe(200);
};
