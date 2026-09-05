import { BREAK_GLASS_ADMIN_PASSWORD } from '@/core/components/SetupWizard/constants';
import { Page, expect } from '@playwright/test';
import { BASE_URL, UI_TIMEOUT } from './e2e.client';

// The password the DEPLOYMENT under test actually has, which is not necessarily
// the one the app baked in. Importing the product's own constant made the suite
// share the app's assumption: against a deployment whose break-glass password
// had been rotated, the test typed the same wrong value the wizard did and both
// failed together, so the suite could never catch the mismatch (dfe-ui#206).
// E2E_ADMIN_PASSWORD lets the harness rotate the credential and still log in.
export const adminPassword = (): string =>
  process.env.E2E_ADMIN_PASSWORD || BREAK_GLASS_ADMIN_PASSWORD;

// The password the deployment booted with, before any rotation -- on a
// dfe-docker stack the generated DFE_AUTH_LOCAL_ADMIN_PASSWORD, not the app's
// constant. The fallback keeps a stack still on the default working.
export const bootstrapPassword = (): string =>
  process.env.E2E_BOOTSTRAP_PASSWORD || BREAK_GLASS_ADMIN_PASSWORD;

export const loginAs = async (page: Page, user: string) => {
  await page.goto(`${BASE_URL}/login`);

  // A deployment with an OIDC provider registered puts the local form behind a
  // tab and opens on the OIDC one; without a provider the form is the page. Both
  // appear only once setup-status has answered, so the wait is on either.
  const localTab = page.getByRole('tab', { name: 'Login with Local' });
  const username = page.getByRole('textbox', { name: 'Username', exact: true });
  await expect(localTab.or(username).first()).toBeVisible({
    timeout: UI_TIMEOUT,
  });
  if (await localTab.isVisible()) await localTab.click();

  await username.fill(user);
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(adminPassword());
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/sources`, {
    timeout: UI_TIMEOUT,
  });
};
