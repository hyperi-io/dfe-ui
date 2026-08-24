import { expect, test } from '@playwright/test';

const baseUrl =
  process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
const welcomePageUrl = `${baseUrl}/setup/welcome`;
const configureOrganisationPageUrl = `${baseUrl}/setup/configureOrganisation`;
const configureOidcPageUrl = `${baseUrl}/setup/configureOidc`;
const configureUserPageUrl = `${baseUrl}/setup/configureUser`;
const configureBreakGlassPageUrl = `${baseUrl}/setup/resetBreakGlass`;
const completePageUrl = `${baseUrl}/setup/complete`;
const landingPageUrl = `${baseUrl}/sources`;

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
  /* Load welcome page and navigate to next step */
  await page.goto(baseUrl);
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  /* Test navigation to back step is enabled on next step */
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE ORGANISATION */
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  /* Test navigation to next step is disabled */
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  /* Fill in form */
  await page.getByRole('textbox', { name: 'Name' }).fill('test_organisation');
  await page
    .getByRole('textbox', { name: 'Display Name' })
    .fill('Test Organisation');
  await page.getByRole('button', { name: 'Save' }).click();
  /* Test navigation to back step is enabled on next step */
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await expect(page.getByText('Primary organisation configured'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE OIDC */
  await expect(page).toHaveURL(configureOidcPageUrl);
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  await page.getByRole('radio', { name: 'Skip for now' }).click();
  /* Test navigation to back step is enabled on next step */
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(configureOidcPageUrl);
  await page.getByRole('button', { name: 'Skip for now' }).click();

  /* CONFIGURE USER */
  await expect(page).toHaveURL(configureUserPageUrl);
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  await page.getByRole('textbox', { name: 'Username' }).fill('test_username');
  await page.getByRole('textbox', { name: 'Password' }).fill('test_password');
  await page.getByRole('button', { name: 'Create Account' }).click();
  /* Test navigation to back step is enabled on next step */
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page).toHaveURL(configureUserPageUrl);
  await expect(page.getByText('Account Created'));
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  /* CONFIGURE BREAK GLASS */
  await expect(page).toHaveURL(configureBreakGlassPageUrl);
  await expect(page.getByRole('button', { name: 'Next' })).toBeDisabled();
  await page
    .getByRole('textbox', { name: 'New Password' })
    .fill('test_break_glass_password');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  /* Test redirect to app */
  await expect(page).toHaveURL(landingPageUrl);

  /* After setup complete, user should not be able to access setup pages */
  await page.goto(welcomePageUrl);
  await expect(page).toHaveURL(landingPageUrl);
  await page.goto(configureOrganisationPageUrl);
  await expect(page).toHaveURL(landingPageUrl);
  await page.goto(configureOidcPageUrl);
  await expect(page).toHaveURL(landingPageUrl);
  await page.goto(configureUserPageUrl);
  await expect(page).toHaveURL(landingPageUrl);
  await page.goto(configureBreakGlassPageUrl);
  await expect(page).toHaveURL(landingPageUrl);
  await page.goto(completePageUrl);
  await expect(page).toHaveURL(landingPageUrl);
});
