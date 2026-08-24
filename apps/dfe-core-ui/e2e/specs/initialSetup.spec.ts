import { expect, test } from '@playwright/test';
import { e2eClient } from '../config/e2e.client';

import { BASE_URL } from '../config/e2e.client';

const baseUrl = BASE_URL;
const welcomePageUrl = `${baseUrl}/setup/welcome`;
const configureOrganisationPageUrl = `${baseUrl}/setup/configureOrganisation`;
const configureLoginPageUrl = `${baseUrl}/setup/configureLogin`;
const configureUserPageUrl = `${baseUrl}/setup/configureUser`;
const configureBreakGlassPageUrl = `${baseUrl}/setup/resetBreakGlassAccount`;
const completePageUrl = `${baseUrl}/setup/complete`;
const loginPageUrl = `${baseUrl}/login`;
const landingPageUrl = `${baseUrl}/sources`;

test.describe.configure({ mode: 'serial' });
test.use({ storageState: { cookies: [], origins: [] } });

test.afterEach(async ({ context }) => {
  await context.clearCookies();
});

test.beforeEach(async ({ playwright }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
});

test.describe('redirect when setup is not complete', () => {
  test('redirect to welcome from base url', async ({ page }) => {
    await page.goto(baseUrl);

    await expect(page).toHaveURL(`${baseUrl}/setup/welcome`);
  });

  test('redirect to welcome from /sources', async ({ page }) => {
    await page.goto(`${baseUrl}/sources`);

    await expect(page).toHaveURL(`${baseUrl}/setup/welcome`);
  });

  test('redirect to welcome from /schemas', async ({ page }) => {
    await page.goto(`${baseUrl}/schemas`);

    await expect(page).toHaveURL(`${baseUrl}/setup/welcome`);
  });
});

test('setup from start testing forward and back navigation', async ({
  page,
}) => {
  /* WELCOME */
  await page.goto(baseUrl);
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
  await expect(page).toHaveURL(configureBreakGlassPageUrl);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(configureUserPageUrl);
  await expect(page.getByText('Account Created'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE BREAK GLASS */
  await expect(page).toHaveURL(configureBreakGlassPageUrl);
  await expect(
    page.getByRole('button', { name: 'Next', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('textbox', { name: 'New Password', exact: true })
    .fill('test_break_glass_password');
  await page
    .getByRole('button', { name: 'Reset Password', exact: true })
    .click();
  await expect(page).toHaveURL(completePageUrl);
  await expect(page).toHaveURL(loginPageUrl);
  await expect(page).toHaveURL(landingPageUrl);
});
