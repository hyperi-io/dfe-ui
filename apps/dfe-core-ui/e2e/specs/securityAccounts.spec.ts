import { randomBytes } from 'node:crypto';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { BASE_URL, e2eClient } from '../config/e2e.client';
import {
  adminPassword,
  completeForcedPasswordChange,
  expectForcedPasswordChange,
  expectSourcesLanding,
  loginAs,
  textbox,
} from '../config/login.helpers';
import { logOut, openSettingsMenu } from '../config/settingsMenu.helpers';

/*
 * The security accounts drawer against a real engine: every account it lists
 * takes the password action it offers, and the new password then signs in
 * through the console. breakglass exists only where gitops does, so the run
 * states which shape the engine is in: E2E_GITOPS=false for an engine without
 * a deploy repo, anything else for one with it.
 */
const GITOPS = process.env.E2E_GITOPS !== 'false';
const RECOVERY_ACCOUNTS = GITOPS ? ['admin', 'breakglass'] : ['admin'];
const ACCOUNT_MANAGEMENT = `${BASE_URL}/settings/admin/account-management`;

// Generated per run: a literal would be a credential to whoever copies the spec.
const freshPassword = (username: string) =>
  `${username}-${randomBytes(9).toString('base64url')}`;

const openSecurityAccounts = async (page: Page): Promise<Locator> => {
  await page.goto(ACCOUNT_MANAGEMENT);
  await page
    .getByRole('button', { name: 'Manage Security Accounts', exact: true })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Manage Security Accounts' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText('Loading security accounts...')).toHaveCount(0);
  return drawer;
};

// One account's card: the SectionCard root carries its details and its action.
const accountCard = (drawer: Locator, username: string) =>
  drawer
    .locator('div.mb-4')
    .filter({ has: drawer.page().getByText(`${username}@dfe.local`) });

const expectNeverEmpty = async (drawer: Locator) => {
  await expect(
    drawer.getByText('This deployment has no admin or break-glass account'),
  ).toHaveCount(0);
  await expect(drawer.getByText('Username:').first()).toBeVisible();
};

const resetPassword = async (
  page: Page,
  drawer: Locator,
  username: string,
  password: string,
) => {
  await accountCard(drawer, username)
    .getByRole('button', { name: 'Reset Password' })
    .click();
  const dialog = page.getByRole('dialog', {
    name: `Reset Password for ${username}`,
  });
  await textbox(page, 'New Password').fill(password);
  await textbox(page, 'Confirm Password').fill(password);
  await dialog.getByRole('button', { name: 'Reset Password' }).click();
  await expect(
    page.getByText(`${username} password reset successfully`),
  ).toBeVisible();
  await expect(dialog).toBeHidden();
};

const signOut = async (page: Page) => {
  await page.goto(`${BASE_URL}/sources`);
  await logOut(page);
  await expect(page).toHaveURL((url) => url.pathname === '/login');
};

const signIn = async (page: Page, username: string, password: string) => {
  await page.goto(`${BASE_URL}/login`);
  await textbox(page, 'Username').fill(username);
  await textbox(page, 'Password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};

test.describe('security accounts', () => {
  test.beforeEach(async ({ playwright, page }) => {
    await e2eClient({ playwright, seedScript: 'reset_all' });
    await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
    await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
    await loginAs(page, 'dfe_admin');
  });

  test('each listed account takes a new password and signs in with it', async ({
    page,
  }) => {
    const drawer = await openSecurityAccounts(page);
    await expectNeverEmpty(drawer);
    for (const username of RECOVERY_ACCOUNTS) {
      await expect(accountCard(drawer, username)).toBeVisible();
    }
    await expect(accountCard(drawer, 'breakglass')).toHaveCount(GITOPS ? 1 : 0);
    // One action per account, the one that works on this deployment.
    await expect(drawer.getByRole('button', { name: /Rotate/ })).toHaveCount(0);

    const passwords = new Map<string, string>();
    for (const username of RECOVERY_ACCOUNTS) {
      const password = freshPassword(username);
      passwords.set(username, password);
      await resetPassword(page, drawer, username, password);
    }

    for (const [username, password] of passwords) {
      await signOut(page);
      await signIn(page, username, password);
      await expectSourcesLanding(page);
      const menu = await openSettingsMenu(page);
      await expect(menu.getByText(username, { exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
    }
  });
});

test.describe('the admin through the setup wizard', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ playwright }) => {
    await e2eClient({ playwright, seedScript: 'reset_all' });
  });

  test('is kept, listed and resettable once setup completes', async ({
    page,
  }) => {
    await signIn(page, 'admin', adminPassword());
    await expectForcedPasswordChange(page);
    await completeForcedPasswordChange(page);

    await expect(page).toHaveURL(`${BASE_URL}/setup/welcome`);
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await textbox(page, 'Name').fill('test_organisation');
    await textbox(page, 'Display Name').fill('Test Organisation');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await page
      .getByRole('button', { name: 'Skip for now', exact: true })
      .click();
    await textbox(page, 'Username').fill('wizard_user');
    await textbox(page, 'Email').fill('wizard_user@example.com');
    await textbox(page, 'Password').fill(freshPassword('wizard_user'));
    await page
      .getByRole('button', { name: 'Create Account', exact: true })
      .click();

    await expect(page).toHaveURL(`${BASE_URL}/setup/complete`);
    await expect(page.getByText(/stays as your local way in/)).toBeVisible();
    await expect(page.getByRole('button', { name: /Retire/ })).toHaveCount(0);
    await page
      .getByRole('button', { name: 'Get started', exact: true })
      .click();
    await expectSourcesLanding(page);

    const drawer = await openSecurityAccounts(page);
    await expectNeverEmpty(drawer);
    const admin = accountCard(drawer, 'admin');
    await expect(admin).toBeVisible();
    await expect(admin.getByText('Retired')).toHaveCount(0);
    await expect(
      admin.getByRole('button', { name: 'Reset Password' }),
    ).toBeEnabled();
    await expect(accountCard(drawer, 'breakglass')).toHaveCount(GITOPS ? 1 : 0);
  });
});
