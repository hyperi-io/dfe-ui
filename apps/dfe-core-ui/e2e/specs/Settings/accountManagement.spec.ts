import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Inviting, updating, deactivating, blocking and deleting an account.
 *
 * Delete refuses an account that is still active, so that test deactivates
 * the account before it deletes it.
 */

const USERNAME = 'e2euser';
const EMAIL = 'e2euser@example.com';
const NAME = 'E2E User';
const RENAMED = 'E2E User Renamed';
const PASSWORD = 'e2e-account-pass';

test.setTimeout(180_000);

test.beforeEach(async ({ playwright, page }) => {
  // The dev indicator sits on the drawer's submit button and takes the click.
  await page.addInitScript(() => {
    const hide = () => {
      document.querySelectorAll('nextjs-portal').forEach((node) => {
        (node as HTMLElement).style.setProperty('pointer-events', 'none');
      });
    };
    hide();
    new MutationObserver(hide).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

const openAccounts = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/account-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/account-management`);
};

const accountSection = (page: Page, title: string) =>
  page
    .getByText(title, { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"border-b")][1]');

const accountRow = (section: Locator, username: string) =>
  section.getByRole('row', { name: username });

const openActions = async (row: Locator) => {
  await row.getByRole('button', { name: 'User actions', exact: true }).click();
};

const inviteAccount = async (page: Page) => {
  await openAccounts(page);
  await page
    .getByRole('button', { name: 'Invite New User', exact: true })
    .click();

  const create = page.getByRole('dialog', { name: 'Create Account' });
  await create.getByPlaceholder('Enter username').fill(USERNAME);
  await create.getByPlaceholder('Enter email').fill(EMAIL);
  await create.getByPlaceholder('Enter name').fill(NAME);
  await create.getByPlaceholder('Enter password').fill(PASSWORD);
  await create
    .getByRole('button', { name: 'Create Account', exact: true })
    .click();

  await expect(page.getByText('Account created successfully')).toBeVisible();

  const accounts = accountSection(page, 'Manage existing accounts');
  await accounts.getByPlaceholder('Search accounts').fill(USERNAME);
  const row = accountRow(accounts, USERNAME);
  await expect(row).toBeVisible();
  return row;
};

const deactivateAccount = async (page: Page, row: Locator) => {
  await openActions(row);
  await page
    .getByRole('button', { name: 'Deactivate Account', exact: true })
    .click();
  await expect(page.getByText('Account deactivated')).toBeVisible();
  await expect(row.getByText('Inactive', { exact: true })).toBeVisible();
};

test.describe('', { tag: [TAGS.core, TAGS.settings, TAGS.account] }, () => {
  test.describe('Account management', { tag: [TAGS.core] }, () => {
    test('user can invite an account', async ({ page }) => {
      const row = await inviteAccount(page);
      await expect(row.getByText(NAME, { exact: true })).toBeVisible();
      await expect(row.getByText('Active', { exact: true })).toBeVisible();
    });

    test('user can update an account', async ({ page }) => {
      const row = await inviteAccount(page);
      await openActions(row);
      await page
        .getByRole('button', { name: `Edit ${USERNAME}`, exact: true })
        .click();

      const edit = page.getByRole('dialog', { name: `Edit ${USERNAME}` });
      await expect(edit.getByPlaceholder('Enter name')).toHaveValue(NAME);
      await edit.getByPlaceholder('Enter name').fill(RENAMED);
      await edit
        .getByRole('button', { name: 'Update Account', exact: true })
        .click();

      await expect(
        page.getByText('Account updated successfully'),
      ).toBeVisible();
      await expect(row.getByText(RENAMED, { exact: true })).toBeVisible();
    });

    test('user can deactivate an account', async ({ page }) => {
      const row = await inviteAccount(page);
      await deactivateAccount(page, row);
    });

    test('user can block an account', async ({ page }) => {
      const row = await inviteAccount(page);
      await openActions(row);
      await page
        .getByRole('button', { name: 'Block Account', exact: true })
        .click();

      await expect(page.getByText('Account blocked')).toBeVisible();
      await expect(row).toHaveCount(0);

      const blocked = accountSection(page, 'Blocked accounts');
      await blocked.getByPlaceholder('Search accounts').fill(USERNAME);
      const blockedRow = accountRow(blocked, USERNAME);
      await expect(blockedRow).toBeVisible();
      await expect(
        blockedRow.getByText('Inactive', { exact: true }),
      ).toBeVisible();
    });

    test('user can delete an account', async ({ page }) => {
      const row = await inviteAccount(page);
      await deactivateAccount(page, row);

      await openActions(row);
      await page
        .getByRole('button', { name: `Delete ${USERNAME}`, exact: true })
        .click();
      const remove = page.getByRole('dialog', { name: 'Delete Account' });
      await remove
        .getByPlaceholder('Enter username to be deleted')
        .fill(USERNAME);
      await remove.getByRole('button', { name: 'Delete', exact: true }).click();

      await expect(
        page.getByText(`${USERNAME} deleted successfully`),
      ).toBeVisible();
      await expect(row).toHaveCount(0);
    });
  });
});
