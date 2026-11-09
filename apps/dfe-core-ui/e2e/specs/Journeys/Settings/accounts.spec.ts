import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';

import {
  ADMIN,
  adminApi,
  adminPage,
  loginToken,
  rowIn,
  section,
  shot,
  stamp,
  tryUiLogin,
  userAction,
} from './settings.helpers';

test.setTimeout(240_000);
const PASSWORD = 'jset-Account-pass-1';

test.describe(
  'jset: accounts',
  { tag: [TAGS.core, TAGS.settings, TAGS.account] },
  () => {
    test('invite, update, block, deactivate, delete -- and the login follows each state', async ({
      page,
      browser,
    }) => {
      const user = `jset-user-${stamp()}`;
      const email = `${user}@example.com`;
      const acct = `/api/v1/auth/accounts/${user}`;
      const admin = await adminApi();
      await adminPage(page);
      await page.goto(`${ADMIN}/account-management`);

      await page
        .getByRole('button', { name: 'Invite New User', exact: true })
        .click();
      const create = page.getByRole('dialog', { name: 'Create Account' });
      await create.getByPlaceholder('Enter username').fill(user);
      await create.getByPlaceholder('Enter email').fill(email);
      await create.getByPlaceholder('Enter name').fill('Jset User');
      await create.getByPlaceholder('Enter password').fill(PASSWORD);
      await shot(page, 'acct-create-dialog');
      await create
        .getByRole('button', { name: 'Create Account', exact: true })
        .click();
      await expect(
        page.getByText('Account created successfully'),
      ).toBeVisible();

      const existing = section(page, 'Manage existing accounts');
      await existing.getByPlaceholder('Search accounts').fill(user);
      const row = rowIn(existing, user);
      await expect(row.getByText('Active', { exact: true })).toBeVisible();
      expect((await admin('GET', acct)).json).toMatchObject({
        username: user,
        email,
        name: 'Jset User',
        enabled: true,
        blocked: false,
      });
      expect((await loginToken(user, PASSWORD)).status).toBe(200);
      const okUi = await tryUiLogin(
        browser,
        user,
        PASSWORD,
        'acct-new-user-landing',
      );
      expect(okUi.path).not.toBe('/login');

      await userAction(page, row, `Edit ${user}`);
      const edit = page.getByRole('dialog', { name: `Edit ${user}` });
      await edit.getByPlaceholder('Enter name').fill('Jset User Renamed');
      await edit
        .getByRole('button', { name: 'Update Account', exact: true })
        .click();
      await expect(
        page.getByText('Account updated successfully'),
      ).toBeVisible();
      await expect(
        row.getByText('Jset User Renamed', { exact: true }),
      ).toBeVisible();
      expect((await admin('GET', acct)).json.name).toBe('Jset User Renamed');

      await userAction(page, row, 'Block Account');
      await expect(page.getByText('Account blocked')).toBeVisible();
      await expect(row).toHaveCount(0);
      const blocked = section(page, 'Blocked accounts');
      await blocked.getByPlaceholder('Search accounts').fill(user);
      await expect(rowIn(blocked, user)).toBeVisible();
      await shot(page, 'acct-blocked-list');
      expect((await admin('GET', acct)).json.blocked).toBe(true);
      const blockedApi = await loginToken(user, PASSWORD);
      expect(blockedApi.status).not.toBe(200);
      const blockedUi = await tryUiLogin(
        browser,
        user,
        PASSWORD,
        'acct-blocked-login',
      );
      expect(blockedUi.path).toBe('/login');

      await userAction(page, rowIn(blocked, user), 'Unblock Account');
      await expect(page.getByText('Account unblocked')).toBeVisible();
      expect((await admin('GET', acct)).json.blocked).toBe(false);
      expect((await loginToken(user, PASSWORD)).status).toBe(200);

      await existing.getByPlaceholder('Search accounts').fill(user);
      await userAction(page, row, 'Deactivate Account');
      await expect(page.getByText('Account deactivated')).toBeVisible();
      await expect(row.getByText('Inactive', { exact: true })).toBeVisible();
      await shot(page, 'acct-deactivated-list');
      expect((await admin('GET', acct)).json.enabled).toBe(false);
      const offApi = await loginToken(user, PASSWORD);
      expect(offApi.status).not.toBe(200);
      const offUi = await tryUiLogin(
        browser,
        user,
        PASSWORD,
        'acct-deactivated-login',
      );
      expect(offUi.path).toBe('/login');

      await userAction(page, row, `Delete ${user}`);
      const remove = page.getByRole('dialog', { name: 'Delete Account' });
      await remove.getByPlaceholder('Enter username to be deleted').fill(user);
      await remove.getByRole('button', { name: 'Delete', exact: true }).click();
      await expect(
        page.getByText(`${user} deleted successfully`),
      ).toBeVisible();
      await expect(row).toHaveCount(0);
      expect((await admin('GET', acct)).status).toBe(404);
      expect((await loginToken(user, PASSWORD)).status).not.toBe(200);
    });
  },
);
