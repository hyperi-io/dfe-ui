import { expect, test, type Page } from '@playwright/test';
import { e2eClient } from '../config/e2e.client';
import { adminPassword } from '../config/login.helpers';

import { BASE_URL } from '../config/e2e.client';

const baseUrl = BASE_URL;
const welcomePageUrl = `${baseUrl}/setup/welcome`;
const configureOrganisationPageUrl = `${baseUrl}/setup/configureOrganisation`;
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
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill('admin');
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(adminPassword());
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};

test.describe('redirect when setup is not complete', () => {
  test('an anonymous visitor is sent to the login, not the wizard', async ({
    page,
  }) => {
    await page.goto(baseUrl);

    await expect(page).toHaveURL(new RegExp(`^${loginPageUrl}`));
  });

  test('/sources lands on the wizard once signed in', async ({ page }) => {
    await page.goto(`${baseUrl}/sources`);
    await login(page);

    await expect(page).toHaveURL(welcomePageUrl);
  });
});

test('setup from start testing forward and back navigation', async ({
  page,
}) => {
  /* LOGIN */
  await page.goto(baseUrl);
  await expect(page).toHaveURL(new RegExp(`^${loginPageUrl}`));
  await login(page);

  /* WELCOME */
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE ORGANISATION */
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('test_organisation');
  await page
    .getByRole('textbox', { name: 'Display Name', exact: true })
    .fill('Test Organisation');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(configureLoginPageUrl);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await expect(page.getByText('Primary organisation configured'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE LOGIN (OIDC) */
  await expect(page).toHaveURL(configureLoginPageUrl);
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();
  await expect(page).toHaveURL(configureUserPageUrl);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(configureLoginPageUrl);
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();

  /* CONFIGURE USER */
  await expect(page).toHaveURL(configureUserPageUrl);
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill('test_username');
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill('test_password');
  await page
    .getByRole('button', { name: 'Create Account', exact: true })
    .click();
  await expect(page).toHaveURL(completePageUrl);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(configureUserPageUrl);
  await expect(page.getByText('Account Created'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* COMPLETE -- already signed in, so it lands in the app, not back on login */
  await expect(page).toHaveURL(completePageUrl);
  await page.getByRole('button', { name: 'Get started', exact: true }).click();
  await expect(page).toHaveURL(`${baseUrl}/sources`);
});
