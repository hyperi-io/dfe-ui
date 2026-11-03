import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

/**
 * Creating, updating, cloning, enabling and deleting a receiver source from the sources page.
 *
 * The source lands on the shared table, so saving it does not ask for a deploy.
 * A clone keeps that table and asks for a new match, because the rule must be unique.
 */

const SOURCE = 'testsource';

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

const createSource = async (
  page: Page,
  source: { displayName: string; description: string },
) => {
  await page.goto(`${BASE_URL}/sources`);
  await page.getByRole('button', { name: 'Add Source', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Add Source' });
  await drawer.getByRole('textbox', { name: /Source Name/ }).fill(SOURCE);
  await drawer
    .getByRole('textbox', { name: /Display Name/ })
    .fill(source.displayName);
  await drawer
    .getByRole('textbox', { name: /Description/ })
    .fill(source.description);
  await drawer.getByRole('textbox', { name: /^Field/ }).fill('_json.data');
  await drawer.getByRole('textbox', { name: /^Value/ }).fill('test-use-case');
  await drawer
    .getByRole('radio', { name: 'Shared table', exact: true })
    .check();
  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(page.getByText('Source created successfully')).toBeVisible({
    timeout: 30_000,
  });
  await expect(page).toHaveURL(
    (url) => url.searchParams.get('source_name') === SOURCE,
  );
};

const openConfiguration = async (page: Page) => {
  await page
    .getByRole('tab', { name: 'Configuration Details', exact: true })
    .click();
};

test.describe('', { tag: ['@core', '@source'] }, () => {
  test('user can add and view a basic source', async ({ page }) => {
    await createSource(page, {
      displayName: 'Test Source',
      description: 'Test Description',
    });

    await expect(
      page.getByRole('heading', { name: /Test Source/ }),
    ).toBeVisible();
    await expect(page.getByTestId(`source-tree-item-${SOURCE}`)).toBeVisible();
    await expect(
      page.getByText('Receiver match: _json.data equals test-use-case'),
    ).toBeVisible();

    await openConfiguration(page);
    const details = page.getByRole('tabpanel', {
      name: 'Configuration Details',
    });
    await expect(
      details.getByText('Test Source', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('Test Description', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('_json.data', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('test-use-case', { exact: true }),
    ).toBeVisible();
  });

  test('user can update a source', async ({ page }) => {
    await createSource(page, {
      displayName: 'Test Source',
      description: 'Test Description',
    });

    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page
      .getByRole('button', { name: 'Edit Source', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Edit Source' });
    await drawer
      .getByRole('textbox', { name: /Display Name/ })
      .fill('Renamed Source');
    await drawer
      .getByRole('textbox', { name: /Description/ })
      .fill('Renamed description');
    await drawer
      .getByRole('button', { name: 'Update Source', exact: true })
      .click();

    await expect(page.getByText(`${SOURCE} updated successfully`)).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('heading', { name: /Renamed Source/ }),
    ).toBeVisible();

    await openConfiguration(page);
    const details = page.getByRole('tabpanel', {
      name: 'Configuration Details',
    });
    await expect(
      details.getByText('Renamed Source', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('Renamed description', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('_json.data', { exact: true }),
    ).toBeVisible();
  });

  test('user can clone a source', async ({ page }) => {
    await createSource(page, {
      displayName: 'Test Source',
      description: 'Test Description',
    });

    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page
      .getByRole('button', { name: 'Clone Source', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Clone Source' });
    await expect(
      drawer.getByRole('textbox', { name: /Source Name/ }),
    ).toHaveValue(`${SOURCE}-copy`);
    await expect(
      drawer.getByRole('textbox', { name: /Display Name/ }),
    ).toHaveValue('Copy - Test Source');
    await expect(
      drawer.getByRole('textbox', { name: /Description/ }),
    ).toHaveValue('Test Description');
    await drawer.getByRole('textbox', { name: /^Field/ }).fill('_json.data');
    await drawer
      .getByRole('textbox', { name: /^Value/ })
      .fill('cloned-use-case');
    await drawer
      .getByRole('button', { name: 'Clone Source', exact: true })
      .click();

    await expect(page.getByText('Source created successfully')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('source_name') === `${SOURCE}-copy`,
    );
    await expect(
      page.getByRole('heading', { name: /Copy - Test Source/ }),
    ).toBeVisible();
    await expect(
      page.getByTestId(`source-tree-item-${SOURCE}-copy`),
    ).toBeVisible();
    await expect(page.getByTestId(`source-tree-item-${SOURCE}`)).toBeVisible();
    await expect(
      page.getByText('Receiver match: _json.data equals cloned-use-case'),
    ).toBeVisible();

    await openConfiguration(page);
    const details = page.getByRole('tabpanel', {
      name: 'Configuration Details',
    });
    await expect(
      details.getByText('Copy - Test Source', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('Test Description', { exact: true }),
    ).toBeVisible();
    await expect(
      details.getByText('cloned-use-case', { exact: true }),
    ).toBeVisible();
  });

  test('user can disable and enable a source', async ({ page }) => {
    await createSource(page, {
      displayName: 'Test Source',
      description: 'Test Description',
    });

    const enabled = page.getByRole('button', { name: 'Enabled', exact: true });
    const disabled = page.getByRole('button', {
      name: 'Disabled',
      exact: true,
    });
    await expect(enabled).toBeVisible();
    await expect(
      page.getByRole('button', { name: `${SOURCE}: source is enabled` }),
    ).toBeVisible();

    await enabled.click();
    await page
      .getByRole('button', { name: 'Disable Source', exact: true })
      .click();
    await expect(disabled).toBeVisible();
    await expect(
      page.getByRole('button', { name: `${SOURCE}: source is disabled` }),
    ).toBeVisible();

    await disabled.click();
    await page
      .getByRole('button', { name: 'Enable Source', exact: true })
      .click();
    await expect(enabled).toBeVisible();
    await expect(
      page.getByRole('button', { name: `${SOURCE}: source is enabled` }),
    ).toBeVisible();
  });

  test('user can remove a source', async ({ page }) => {
    await createSource(page, {
      displayName: 'Test Source',
      description: 'Test Description',
    });

    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page
      .getByRole('button', { name: 'Delete Source', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: `Delete ${SOURCE}` });
    await expect(
      dialog.getByText('Are you sure you want to delete this source?'),
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(dialog).toBeHidden();
    await expect(page.getByTestId(`source-tree-item-${SOURCE}`)).toHaveCount(0);
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('source_name') === null,
    );
  });
});
