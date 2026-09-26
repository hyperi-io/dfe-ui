import { expect, test } from '@playwright/test';
import { oidcFixture } from '../config/login.helpers';
import {
  IDP_SIGN_IN,
  assertConsoleSession,
  assertOidcSessionUsable,
  chooseProvider,
  clickLogin,
  oidcProviders,
  openProviderPicker,
} from '../config/oidc.helpers';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('OIDC login', () => {
  test('the picker offers exactly the providers setup-status reports', async ({
    page,
    request,
  }) => {
    const providers = await oidcProviders(request);
    test.skip(providers.length === 0, 'no OIDC provider is enabled here');

    await openProviderPicker(page);

    for (const provider of providers) {
      await expect(
        page.locator(
          `.ant-select-item-option[title="${provider.display_name}"]`,
        ),
      ).toBeVisible();
    }
    await expect(page.locator('.ant-select-item-option')).toHaveCount(
      providers.length,
    );
  });

  test('choosing a provider hands the browser to that provider', async ({
    page,
    request,
  }) => {
    const providers = await oidcProviders(request);
    test.skip(providers.length === 0, 'no OIDC provider is enabled here');
    const provider = providers[0];

    await openProviderPicker(page);
    await chooseProvider(page, provider);

    // redirect=false: the client reads the login URL back, so this fetch fires
    // whether or not the IdP itself is reachable from the runner.
    const login = page.waitForRequest(
      // The provider name comes from the stack under test, and the match runs in the test runner.
      // nosemgrep: javascript.lang.security.audit.detect-non-literal-regexp.detect-non-literal-regexp
      new RegExp(`/api/v1/auth/oidc/${provider.name}/login`),
    );
    await clickLogin(page);
    await login;
  });

  test('the fixture login lands in the console with a usable session', async ({
    page,
    request,
  }) => {
    const providers = await oidcProviders(request);
    const runnable = providers.flatMap((provider) => {
      const signIn = IDP_SIGN_IN[provider.name];
      const fixture = oidcFixture(provider.name);
      return signIn && fixture ? [{ provider, signIn, fixture }] : [];
    });

    test.skip(
      runnable.length === 0,
      `no provider here has both a fixture password and a verified sign-in flow (offered: ${
        providers.map((provider) => provider.name).join(', ') || 'none'
      })`,
    );

    for (const { provider, signIn, fixture } of runnable) {
      await test.step(`sign in through ${provider.name}`, async () => {
        // Clear the console and IdP sessions too, so each provider signs in from cold.
        await page.context().clearCookies();

        await openProviderPicker(page);
        await chooseProvider(page, provider);
        await clickLogin(page);
        await signIn(page, fixture);

        const session = await assertConsoleSession(page);
        expect(page.url()).not.toContain('access_token');
        await assertOidcSessionUsable(request, session);
      });
    }
  });
});
