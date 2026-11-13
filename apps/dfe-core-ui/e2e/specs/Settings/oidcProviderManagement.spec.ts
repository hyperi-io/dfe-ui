import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { rx } from '@e2e/config/regex.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Adding, viewing, updating and deleting an OIDC provider, and the accounts
 * that signed in through one.
 *
 * The provider menu has no clone action. Deleting a provider disables every
 * account that signed in through it and renames the account, so the old
 * username leaves the account list.
 *
 * reset_all keeps a provider created through the API, so the one this spec
 * adds uses a unique name.
 */

const CLIENT_ID = 'e2e-client';
const CLIENT_SECRET = 'e2e-client-secret';
const ISSUER = 'https://accounts.google.com';

const SEEDED_PROVIDER = 'searchable-oidc-0';
const SEEDED_ACCOUNT = 'searchable-account-0';

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

const openProviders = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/oidc-provider-management`);
  await expect(page).toHaveURL(
    `${BASE_URL}/settings/admin/oidc-provider-management`,
  );
};

const providerCard = (page: Page, name: string) =>
  page.locator('li').filter({
    has: page.getByRole('heading', { name: rx`\(${name}\)` }),
  });

const openActions = async (card: Locator) => {
  await card
    .getByRole('button', { name: 'OIDC Provider actions', exact: true })
    .click();
};

const fillCredentialValue = async (
  page: Page,
  dialog: Locator,
  label: string,
  value: string,
) => {
  const source = dialog.getByRole('combobox', { name: `${label} source` });
  await source.click();
  const listId = await source.getAttribute('aria-controls');
  await page
    .locator(`[id="${listId}"]`)
    .getByRole('option', { name: 'Value', exact: true })
    .click();
  await dialog.getByRole('textbox', { name: label, exact: true }).fill(value);
};

const createProvider = async (
  page: Page,
  name: string,
  displayName: string,
) => {
  await openProviders(page);
  await page
    .getByRole('button', { name: 'Configure New OIDC Provider', exact: true })
    .click();

  const create = page.getByRole('dialog', {
    name: 'Configure New OIDC Provider',
  });
  await create.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await create
    .getByRole('textbox', { name: 'Display Name', exact: true })
    .fill(displayName);
  await fillCredentialValue(page, create, 'Client ID', CLIENT_ID);
  await fillCredentialValue(page, create, 'Client Secret', CLIENT_SECRET);
  await create.getByRole('button', { name: 'Create', exact: true }).click();

  await expect(
    page.getByText('OIDC provider created successfully'),
  ).toBeVisible();
  const card = providerCard(page, name);
  await expect(card).toBeVisible();
  return card;
};

const seedProviderUsers = async (
  playwright: Parameters<typeof e2eClient>[0]['playwright'],
) => {
  await e2eClient({ playwright, seedScript: 'seed_searchable_accounts' });
  await e2eClient({
    playwright,
    seedScript: 'seed_searchable_oidc_providers',
  });
  await e2eClient({ playwright, seedScript: 'seed_searchable_oidc_users' });
};

test.describe('', { tag: [TAGS.core, TAGS.settings] }, () => {
  test('user can add, view, update and delete an OIDC provider', async ({
    page,
  }) => {
    const name = `e2eoidc${Date.now().toString().slice(-6)}`;
    const displayName = `E2E OIDC ${name}`;
    const renamed = `${displayName} Renamed`;
    const card = await createProvider(page, name, displayName);

    await openActions(card);
    await expect(page.getByRole('button', { name: /Clone/ })).toHaveCount(0);
    await page
      .getByRole('button', { name: `View ${name} details`, exact: true })
      .click();
    const details = page.getByRole('dialog', {
      name: 'OIDC Provider Details',
    });
    await expect(
      details.getByRole('heading', { name: displayName, exact: true }),
    ).toBeVisible();
    await expect(details.getByText(name, { exact: true })).toBeVisible();
    await expect(details.getByText(ISSUER, { exact: true })).toBeVisible();
    await details.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(details).toBeHidden();

    await openActions(card);
    await page
      .getByRole('button', { name: `Edit ${displayName}`, exact: true })
      .click();
    const edit = page.getByRole('dialog', { name: 'Edit OIDC Provider' });
    await expect(
      edit.getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue(name);
    await expect(
      edit.getByRole('textbox', { name: 'Name', exact: true }),
    ).toBeDisabled();
    await edit
      .getByRole('textbox', { name: 'Display Name', exact: true })
      .fill(renamed);
    await edit.getByRole('button', { name: 'Update', exact: true }).click();

    await expect(
      page.getByText(`${renamed} updated successfully`),
    ).toBeVisible();
    await expect(card.getByRole('heading', { name: renamed })).toBeVisible();

    await openActions(card);
    await page
      .getByRole('button', { name: `Delete ${name}`, exact: true })
      .click();
    const remove = page.getByRole('dialog', {
      name: 'Delete OIDC Provider',
    });
    await remove
      .getByPlaceholder('Enter OIDC Provider Name to be deleted')
      .fill(name);
    await remove.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText(`${name} deleted successfully`)).toBeVisible();
    await expect(providerCard(page, name)).toHaveCount(0);
  });

  test('user can view the accounts that signed in through a provider', async ({
    playwright,
    page,
  }) => {
    await seedProviderUsers(playwright);
    await openProviders(page);

    const card = providerCard(page, SEEDED_PROVIDER);
    await card.scrollIntoViewIfNeeded();
    await openActions(card);
    await page
      .getByRole('button', {
        name: `View ${SEEDED_PROVIDER} details`,
        exact: true,
      })
      .click();

    const details = page.getByRole('dialog', {
      name: 'OIDC Provider Details',
    });
    await details.getByRole('tab', { name: 'Users', exact: true }).click();
    await expect(
      details.getByRole('cell', { name: SEEDED_ACCOUNT, exact: true }),
    ).toBeVisible();
  });

  test('deleting a provider removes the accounts that signed in through it', async ({
    playwright,
    page,
  }) => {
    await seedProviderUsers(playwright);
    await openProviders(page);

    const card = providerCard(page, SEEDED_PROVIDER);
    await card.scrollIntoViewIfNeeded();
    await openActions(card);
    await page
      .getByRole('button', {
        name: `Delete ${SEEDED_PROVIDER}`,
        exact: true,
      })
      .click();

    const remove = page.getByRole('dialog', {
      name: 'Delete OIDC Provider',
    });
    await expect(
      remove.getByText(/accounts are associated with this OIDC Provider/),
    ).toBeVisible();
    await expect(
      remove.getByText(
        'Accounts will be deleted and user access will be revoked.',
      ),
    ).toBeVisible();
    await remove
      .getByPlaceholder('Enter OIDC Provider Name to be deleted')
      .fill(SEEDED_PROVIDER);
    await remove.getByRole('button', { name: 'Delete', exact: true }).click();

    // The signed-in admin signed in through this provider, so the delete
    // revokes that session and the app returns to login.
    await page.waitForURL(/\/login/);

    await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
    await loginAs(page, 'dfe_admin');
    await openProviders(page);
    await expect(providerCard(page, SEEDED_PROVIDER)).toHaveCount(0);

    await page.goto(`${BASE_URL}/settings/admin/account-management`);
    const accounts = page
      .getByText('Manage existing accounts', { exact: true })
      .locator('xpath=ancestor::div[contains(@class,"border-b")][1]');
    await accounts.getByPlaceholder('Search accounts').fill(SEEDED_ACCOUNT);
    await expect(accounts.getByText('No accounts found')).toBeVisible();
  });
});
