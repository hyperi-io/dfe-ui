import { e2eClient } from '@e2e/config/e2e.client';
import {
  adminPassword,
  completeForcedPasswordChange,
  expectForcedPasswordChange,
  expectSourcesLanding,
  textbox,
} from '@e2e/config/login.helpers';
import { expect, test, type Page } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { TAGS } from '@e2e/config/tags.constants';

const baseUrl = BASE_URL;
const welcomePageUrl = `${baseUrl}/setup/welcome`;
const configureOrganisationPageUrl = `${baseUrl}/setup/configureOrganisation`;
const configureSourcePageUrl = `${baseUrl}/setup/configureSource`;
const configureLoginPageUrl = `${baseUrl}/setup/configureLogin`;
const configureUserPageUrl = `${baseUrl}/setup/configureUser`;
const completePageUrl = `${baseUrl}/setup/complete`;
const loginPageUrl = `${baseUrl}/login`;

test.describe.configure({ mode: 'serial' });
test.use({ storageState: { cookies: [], origins: [] } });

test.afterEach(async ({ context }) => {
  await context.clearCookies();
});

test.beforeEach(async ({ playwright }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
});

// Sign in with the password the DEPLOYMENT minted, never a literal: the wizard
// runs on authenticated engine calls, so a wrong password here fails setup the
// same way a baked-in one did in the product (dfe-ui#206).
const login = async (page: Page) => {
  // An enabled provider offers OIDC first and keeps the local form on the other tab.
  const localTab = page.getByRole('tab', {
    name: 'Login with Local',
    exact: true,
  });
  const username = textbox(page, 'Username');
  // Once the local tab is selected, the tab and the username field are both
  // present. Waiting for exactly one of them fails that page.
  await expect(localTab.or(username).first()).toBeVisible();
  if (await localTab.isVisible()) {
    await localTab.click();
  }

  await username.fill('admin');
  await textbox(page, 'Password').fill(adminPassword());
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};

/** Leave the OIDC step. Next is there once the provider has tested. */
const continueOidc = async (page: Page) => {
  const next = page.getByRole('button', { name: 'Next', exact: true });
  const skip = page.getByRole('button', { name: 'Skip for now', exact: true });
  await expect(next.or(skip).first()).toBeVisible();
  if (await next.isVisible()) {
    await next.click();
    return;
  }
  await skip.click();
};

test.describe('', { tag: [TAGS.core] }, () => {
  test.describe('redirect when setup is not complete', () => {
    test('an anonymous visitor is sent to the login, not the wizard', async ({
      page,
    }) => {
      await page.goto(baseUrl);

      await expect(page).toHaveURL(new RegExp(`^${loginPageUrl}`));
    });

    test('the issued password is changed before the wizard, or anything else, opens', async ({
      page,
    }) => {
      await page.goto(`${baseUrl}/sources`);
      await login(page);

      await expectForcedPasswordChange(page);
      // Neither the wizard nor a console page renders around the change.
      await page.goto(`${baseUrl}/setup`);
      await expectForcedPasswordChange(page);
      await page.goto(`${baseUrl}/sources`);
      await expectForcedPasswordChange(page);
    });

    test('/sources lands on the wizard once signed in', async ({ page }) => {
      await page.goto(`${baseUrl}/sources`);
      await login(page);
      await completeForcedPasswordChange(page);

      await expect(page).toHaveURL(welcomePageUrl);
    });
  });

  test('setup from start testing forward and back navigation', async ({
    page,
  }) => {
    test.slow();
    /* LOGIN */
    await page.goto(baseUrl);
    await expect(page).toHaveURL(new RegExp(`^${loginPageUrl}`));
    await login(page);

    /* FORCED PASSWORD CHANGE */
    await expectForcedPasswordChange(page);
    await completeForcedPasswordChange(page);

    /* WELCOME */
    await expect(page).toHaveURL(welcomePageUrl);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page).toHaveURL(configureOrganisationPageUrl);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(welcomePageUrl);
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    /* CONFIGURE ORGANISATION */
    await expect(page).toHaveURL(configureOrganisationPageUrl);
    // Save is the only way forward until the organisation exists.
    await expect(
      page.getByRole('button', { name: 'Next', exact: true }),
    ).toHaveCount(0);
    await textbox(page, 'Name').fill('test_organisation');
    await textbox(page, 'Display Name').fill('Test Organisation');
    await page
      .getByRole('button', { name: 'Save and continue', exact: true })
      .click();

    /* CONFIGURE SOURCE */
    await expect(page).toHaveURL(configureSourcePageUrl);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(configureOrganisationPageUrl);
    await expect(
      page.getByText('Primary organisation configured'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page).toHaveURL(configureSourcePageUrl);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(configureOrganisationPageUrl);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(welcomePageUrl);
    // The organisation exists now. Welcome's Next stops on the source step,
    // which the engine's setup machine does not report.
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page).toHaveURL(configureSourcePageUrl);
    await page
      .getByRole('button', { name: 'Skip for now', exact: true })
      .click();

    /* CONFIGURE LOGIN (OIDC) */
    await expect(page).toHaveURL(configureLoginPageUrl);
    // A tested provider offers Next. Until the test passes, Skip is the way on.
    await continueOidc(page);
    await expect(page).toHaveURL(configureUserPageUrl);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL(configureLoginPageUrl);
    await continueOidc(page);

    /* CONFIGURE USER */
    await expect(page).toHaveURL(configureUserPageUrl);
    await expect(
      page.getByRole('button', { name: 'Next', exact: true }),
    ).toBeDisabled();
    // A configured provider opens on its own tab. The local account form is the other one.
    const localUser = page.getByRole('tab', {
      name: 'Configure Local User',
      exact: true,
    });
    const username = textbox(page, 'Username');
    await expect(localUser.or(username).first()).toBeVisible();
    if (await localUser.isVisible()) {
      await localUser.click();
    }
    await username.fill('test_username');
    await textbox(page, 'Email').fill('test_username@example.com');
    await textbox(page, 'Password').fill('test_password');
    await page
      .getByRole('button', { name: 'Create Account', exact: true })
      .click();

    /* COMPLETE -- the account completed setup, so the steps behind it are closed */
    await expect(page).toHaveURL(completePageUrl);
    await expect(
      page.getByRole('heading', { name: 'Complete', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Back', exact: true }),
    ).toHaveCount(0);
    // Already signed in, so it lands in the app, not back on login.
    await page
      .getByRole('button', { name: 'Get started', exact: true })
      .click();
    await expectSourcesLanding(page);
  });
});
