import { randomBytes } from 'node:crypto';
import { expect, test, type Page } from '@playwright/test';
import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import {
  adminPassword,
  expectSourcesLanding,
  loginAs,
  textbox,
} from '@e2e/config/login.helpers';

const USER = 'dfe_admin';
const ACCOUNT = `${BASE_URL}/account`;

// Generated per run: a literal would be a credential to whoever copies the spec.
const freshPassword = () => `profile-${randomBytes(9).toString('base64url')}`;

const openProfile = async (page: Page) => {
  await page.goto(ACCOUNT);
  await expect(
    page.getByText('Reset your user account password'),
  ).toBeVisible();
  await expect(
    page.getByText('View and manage your user account information'),
  ).toBeVisible();
};

const signIn = async (page: Page, password: string) => {
  await textbox(page, 'Username').fill(USER);
  await textbox(page, 'Password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};

test.describe('user profile', { tag: ['@core', '@account'] }, () => {
  test.beforeEach(async ({ playwright, page }) => {
    test.slow();
    await e2eClient({ playwright, seedScript: 'reset_all' });
    await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
    await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
    await loginAs(page, USER);
  });

  test('the signed-in account updates its profile', async ({ page }) => {
    const name = 'E2E Profile';
    const email = `e2e-profile-${randomBytes(4).toString('hex')}@example.com`;
    const phone = '+15551212';

    await openProfile(page);
    await page
      .getByRole('button', { name: 'Update Profile', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Update Profile' });
    await expect(drawer).toBeVisible();
    await expect(textbox(page, 'Email')).toBeVisible();

    await textbox(page, 'Email').fill(email);
    await textbox(page, 'Name').fill(name);
    await textbox(page, 'Phone').fill(phone);
    await drawer
      .getByRole('button', { name: 'Update Profile', exact: true })
      .click();

    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    await expect(drawer).toBeHidden();
    await expect(page.getByText(`Welcome, ${name}!`)).toBeVisible();

    await page
      .getByRole('button', { name: 'Update Profile', exact: true })
      .click();
    await expect(textbox(page, 'Email')).toHaveValue(email);
    await expect(textbox(page, 'Name')).toHaveValue(name);
    await expect(textbox(page, 'Phone')).toHaveValue(phone);
  });

  test('the signed-in account resets its own password', async ({ page }) => {
    const password = freshPassword();

    await openProfile(page);
    await page
      .getByRole('button', { name: 'Reset Password', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Reset Password' });
    await expect(drawer).toBeVisible();

    await textbox(page, 'Current Password').fill(adminPassword());
    await textbox(page, 'New Password').fill(password);
    await textbox(page, 'Confirm Password').fill(password);
    await drawer
      .getByRole('button', { name: 'Reset Password', exact: true })
      .click();

    await expect(page).toHaveURL((url) => url.pathname === '/login');
    await expect(page.getByText('Password changed')).toBeVisible();
    await expect(
      page.getByText('Sign in with your new password.'),
    ).toBeVisible();

    await signIn(page, adminPassword());
    await expect(
      page.getByText('Unable to login. Please try again.'),
    ).toBeVisible();
    await expect(page).toHaveURL((url) => url.pathname === '/login');

    await signIn(page, password);
    await expectSourcesLanding(page);
  });
});
