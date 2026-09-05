import { expect, test } from '@playwright/test';
import {
  BASE_URL,
  ENGINE_API_URL,
  transportOptions,
} from '../config/e2e.client';
import { ADMIN_USERNAME } from '../config/acceptance.helpers';
import { adminPassword, bootstrapPassword } from '../config/login.helpers';

// Acceptance tier: runs against a deployment, so there is no seed API and no
// reset_all. Precondition is a fresh deployment -- setup not complete, admin on
// the password the deployment booted with.
const rotatedPassword = adminPassword();
const welcomePageUrl = `${BASE_URL}/setup/welcome`;
const configureOrganisationPageUrl = `${BASE_URL}/setup/configureOrganisation`;
const configureLoginPageUrl = `${BASE_URL}/setup/configureLogin`;
const configureUserPageUrl = `${BASE_URL}/setup/configureUser`;
const configureBreakGlassPageUrl = `${BASE_URL}/setup/resetBreakGlassAccount`;

test.describe.configure({ mode: 'serial' });
test.use({ storageState: { cookies: [], origins: [] } });

test.skip(
  rotatedPassword === bootstrapPassword(),
  'set E2E_ADMIN_PASSWORD to something other than the deployment bootstrap password to exercise rotation',
);

test('@acceptance setup completes after the break-glass password is rotated first', async ({
  page,
  playwright,
}) => {
  // Rotate through the product API, as an operator or an init script would,
  // before the wizard has ever run.
  const api = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    ...transportOptions(),
  });
  const bootstrapLogin = await api.post('/api/v1/auth/login', {
    data: { username: ADMIN_USERNAME, password: bootstrapPassword() },
  });
  if (bootstrapLogin.ok()) {
    const { access_token: accessToken } = await bootstrapLogin.json();
    const reset = await api.post(
      `/api/v1/auth/accounts/${ADMIN_USERNAME}/reset-password`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { new_password: rotatedPassword },
      },
    );
    expect(
      reset.ok(),
      'rotation through the product API must succeed',
    ).toBeTruthy();
  } else {
    // A harness rotated before the run; the rotated credential must then log
    // in, or this is not the fresh deployment the spec needs.
    const rotatedLogin = await api.post('/api/v1/auth/login', {
      data: { username: ADMIN_USERNAME, password: rotatedPassword },
    });
    expect(
      rotatedLogin.ok(),
      'neither the bootstrap nor the rotated password logs in',
    ).toBeTruthy();
  }
  await api.dispose();

  // WELCOME
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  // ORGANISATION -- the first step that writes through the authenticated API,
  // and where dfe-ui#206 stops a rotated deployment: the wizard auto-logs-in
  // with the constant it carries, so the save is unauthenticated.
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('rotated_org');
  await page
    .getByRole('textbox', { name: 'Display Name', exact: true })
    .fill('Rotated Org');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page).toHaveURL(configureLoginPageUrl);

  // LOGIN (OIDC) -- optional, and a local-auth deployment skips it.
  await page.getByRole('button', { name: 'Skip for now', exact: true }).click();

  // FIRST USER
  await expect(page).toHaveURL(configureUserPageUrl);
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill('rotated_user');
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(rotatedPassword);
  await page
    .getByRole('button', { name: 'Create Account', exact: true })
    .click();

  // BREAK GLASS -- the wizard's own rotation, on top of the operator's.
  await expect(page).toHaveURL(configureBreakGlassPageUrl);
  await page
    .getByRole('textbox', { name: 'New Password', exact: true })
    .fill(rotatedPassword);
  await page
    .getByRole('button', { name: 'Reset Password', exact: true })
    .click();

  // COMPLETE -- the wizard hands off to the login screen, then the landing page.
  await expect(page).toHaveURL(`${BASE_URL}/sources`, { timeout: 60_000 });
});
