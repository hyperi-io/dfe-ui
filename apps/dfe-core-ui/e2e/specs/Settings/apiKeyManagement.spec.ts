import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { rx } from '@e2e/config/regex.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Creating, cloning and revoking an API key.
 *
 * Expiry can be left empty. reset_all keeps a key created through the API,
 * so each test uses a unique name. Clone offers that name with `_clone`.
 */

const DESCRIPTION = 'E2E API key';

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

const openApiKeys = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/admin/api-key-management`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/admin/api-key-management`);
};

/** The API keys card. The header holds the search box and not the table. */
const apiKeysSection = (page: Page) =>
  page
    .locator('div')
    .filter({ has: page.getByText('API keys', { exact: true }) })
    .filter({ has: page.getByPlaceholder('Search', { exact: true }) })
    .filter({ has: page.locator('.ant-table') })
    .last();

const keyRow = (section: Locator, name: string) =>
  section.getByRole('row', { name: rx`\s${name}\s` });

const acknowledgeKey = async (page: Page) => {
  const generated = page.getByRole('dialog', { name: 'API Key Generated' });
  await expect(generated).toBeVisible();
  await generated
    .getByRole('button', { name: 'I have copied the API key', exact: true })
    .click();
  await expect(generated).toBeHidden();
};

const createKey = async (page: Page, name: string) => {
  await openApiKeys(page);
  await page
    .getByRole('button', { name: 'Generate API Key', exact: true })
    .click();

  const create = page.getByRole('dialog', { name: 'Generate API Key' });
  const expires = create
    .locator('.ant-form-item')
    .filter({ hasText: 'Expires' });
  await expect(expires.locator('label')).not.toHaveClass(
    /ant-form-item-required/,
  );
  await create.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
  await create
    .getByRole('textbox', { name: 'Description', exact: true })
    .fill(DESCRIPTION);
  await create.getByRole('button', { name: 'Generate', exact: true }).click();
  await acknowledgeKey(page);

  const section = apiKeysSection(page);
  await section.getByPlaceholder('Search', { exact: true }).fill(name);
  const row = keyRow(section, name);
  await expect(row).toBeVisible();
  return row;
};

test.describe('', { tag: [TAGS.core, TAGS.settings] }, () => {
  test('user can create an API key without an expiry', async ({ page }) => {
    const name = `e2ekey${Date.now().toString().slice(-6)}`;
    await createKey(page, name);
  });

  test('user can clone an API key', async ({ page }) => {
    const name = `e2ekey${Date.now().toString().slice(-6)}`;
    const row = await createKey(page, name);

    await row
      .getByRole('button', { name: 'Clone API Key', exact: true })
      .click();
    const clone = page.getByRole('dialog', { name: 'Clone API Key' });
    await expect(
      clone.getByRole('textbox', { name: 'Name', exact: true }),
    ).toHaveValue(`${name}_clone`);
    await expect(
      clone.getByRole('textbox', { name: 'Description', exact: true }),
    ).toHaveValue(DESCRIPTION);
    await clone.getByRole('button', { name: 'Generate', exact: true }).click();
    await acknowledgeKey(page);

    await expect(keyRow(apiKeysSection(page), `${name}_clone`)).toBeVisible();
  });

  test('user can revoke an API key', async ({ page }) => {
    const name = `e2ekey${Date.now().toString().slice(-6)}`;
    const row = await createKey(page, name);

    await row
      .getByRole('button', { name: 'Revoke API Key', exact: true })
      .click();
    const revoke = page.getByRole('dialog').filter({ hasText: name });
    await expect(
      revoke.getByText('This action cannot be undone.'),
    ).toBeVisible();
    await revoke
      .getByRole('button', { name: 'Revoke API Key', exact: true })
      .click();

    await expect(keyRow(apiKeysSection(page), name)).toHaveCount(0);
  });
});
