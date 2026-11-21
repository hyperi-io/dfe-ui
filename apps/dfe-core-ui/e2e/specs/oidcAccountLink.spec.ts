import { expect, test } from '@playwright/test';
import { ENGINE_API_URL } from '@e2e/config/e2e.client';
import { oidcFixture } from '@e2e/config/login.helpers';
import {
  IDP_SIGN_IN,
  assertConsoleSession,
  chooseProvider,
  clickLogin,
  oidcProviders,
  openProviderPicker,
} from '@e2e/config/oidc.helpers';

/**
 * An IdP sign-in whose verified email matches a local account links to it once
 * that account's password is given, and signs straight in after that.
 *
 * Needs a dex provider trusted for the fixture user's email domain, and a local
 * account holding that email, named by DFE_E2E_LINK_ACCOUNT, with its password
 * in DFE_E2E_LINK_PASSWORD. The link must not exist yet.
 */

const PROVIDER = 'dex';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OIDC account linking', () => {
  test('a local account links on its password, then signs in without one', async ({
    page,
    request,
  }) => {
    const account = process.env.DFE_E2E_LINK_ACCOUNT;
    const password = process.env.DFE_E2E_LINK_PASSWORD;
    const fixture = oidcFixture(PROVIDER);
    const provider = (await oidcProviders(request)).find(
      (offered) => offered.name === PROVIDER,
    );
    const signIn = IDP_SIGN_IN[PROVIDER];
    test.skip(
      !provider || !fixture || !signIn || !account || !password,
      'needs a dex provider, its fixture password and DFE_E2E_LINK_ACCOUNT/PASSWORD',
    );
    if (!provider || !fixture || !signIn || !account || !password) return;

    const signInThroughDex = async () => {
      await page.context().clearCookies();
      await openProviderPicker(page);
      await chooseProvider(page, provider);
      await clickLogin(page);
      await signIn(page, fixture);
    };

    await test.step('the first sign-in asks for the local password', async () => {
      await signInThroughDex();
      await expect(page.getByText(account, { exact: true })).toBeVisible({
        timeout: 60000,
      });
      await page.getByLabel('Password').fill(password);
      await page.getByRole('button', { name: /link and sign in/i }).click();
      const session = await assertConsoleSession(page);
      const me = await request.get(`${ENGINE_API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${session.user?.accessToken}` },
      });
      expect((await me.json()).user_id).toBe(account);
    });

    await test.step('the next sign-in goes straight in', async () => {
      await signInThroughDex();
      const session = await assertConsoleSession(page);
      expect(session.user?.accessToken).toBeTruthy();
      expect(page.url()).not.toContain('link_ticket');
    });
  });
});
