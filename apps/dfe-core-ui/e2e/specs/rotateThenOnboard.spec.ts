import {
  BREAK_GLASS_ADMIN_PASSWORD,
  BREAK_GLASS_ADMIN_USERNAME,
} from '@/core/components/SetupWizard/constants';
import { expect, test } from '@playwright/test';
import { BASE_URL, ENGINE_API_URL } from '../config/e2e.client';
import { adminPassword } from '../config/login.helpers';

// Acceptance tier: runs against a deployment, so there is no seed API and no
// reset_all. Precondition is a fresh deployment -- setup not complete, admin on
// its bootstrap password.
const rotatedPassword = adminPassword();
const welcomePageUrl = `${BASE_URL}/setup/welcome`;
const configureOrganisationPageUrl = `${BASE_URL}/setup/configureOrganisation`;
const configureLoginPageUrl = `${BASE_URL}/setup/configureLogin`;

test.describe.configure({ mode: 'serial' });
test.use({ storageState: { cookies: [], origins: [] } });

test.skip(
  rotatedPassword === BREAK_GLASS_ADMIN_PASSWORD,
  'set E2E_ADMIN_PASSWORD to something other than the bootstrap default to exercise rotation',
);

test('@acceptance setup completes after the break-glass password is rotated first', async ({
  page,
  playwright,
}) => {
  // Rotate through the product API, as an operator would, before the wizard
  // has ever run.
  const api = await playwright.request.newContext({ baseURL: ENGINE_API_URL });
  const bootstrapLogin = await api.post('/api/v1/auth/login', {
    data: {
      username: BREAK_GLASS_ADMIN_USERNAME,
      password: BREAK_GLASS_ADMIN_PASSWORD,
    },
  });
  if (bootstrapLogin.ok()) {
    const { access_token: accessToken } = await bootstrapLogin.json();
    const reset = await api.post(
      `/api/v1/auth/accounts/${BREAK_GLASS_ADMIN_USERNAME}/reset-password`,
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
    // A harness (dfe-ops ui) rotated before the run; the rotated credential
    // must then log in, or this is not the fresh deployment the spec needs.
    const rotatedLogin = await api.post('/api/v1/auth/login', {
      data: {
        username: BREAK_GLASS_ADMIN_USERNAME,
        password: rotatedPassword,
      },
    });
    expect(
      rotatedLogin.ok(),
      'neither the bootstrap nor the rotated password logs in',
    ).toBeTruthy();
  }
  await api.dispose();

  // The wizard must still get past its first required step.
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(welcomePageUrl);
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page).toHaveURL(configureOrganisationPageUrl);
  await page
    .getByRole('textbox', { name: 'Name', exact: true })
    .fill('rotated_org');
  await page
    .getByRole('textbox', { name: 'Display Name', exact: true })
    .fill('Rotated Org');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  // dfe-ui#206: the wizard can only auto-login with the bootstrap password it
  // carries, so today this stays on the organisation page.
  await expect(page).toHaveURL(configureLoginPageUrl);
});
