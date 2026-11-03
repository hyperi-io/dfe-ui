import { APIRequestContext, Page, expect, test } from '@playwright/test';

import { BASE_URL, ENGINE_API_URL, e2eClient } from '../../config/e2e.client';
import { adminPassword, loginAs } from '../../config/login.helpers';

/**
 * Hunt schemas from Other Schemas: typed by hand, read from a CSV, read from
 * an Elastic index template, then cloned, deleted and versioned.
 *
 * The form defaults to a header, so each create switches the type to Hunt
 * Schema. The registry path is hunts/<name>, and that folder starts collapsed.
 * A schema name is letters, numbers and underscores. Login compiles the
 * landing page, and each save reviews before it writes, so the 30s default
 * ends the test first.
 *
 * A derived schema takes its columns from a meta schema, so that journey
 * stays on the meta schemas spec.
 */

const SCHEMAS = '/schemas/other-schemas';
const HUNT = 'hunts';

test.describe.configure({ timeout: 120_000 });

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
  await page.goto(`${BASE_URL}${SCHEMAS}`);
});

const openAddSchema = async (page: Page) => {
  await page.getByRole('button', { name: 'Add Schema', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Add Schema' });
  await drawer.getByRole('combobox', { name: 'Schema Type' }).click();
  // The listbox option is hidden. The open menu draws the label beside it.
  await page.getByText('Hunt Schema', { exact: true }).click();
  await expect(drawer.getByTitle('Hunt Schema')).toBeVisible();
  return drawer;
};

const fillIdentity = async (
  drawer: ReturnType<Page['getByRole']>,
  schema: { name: string; description: string },
) => {
  await drawer.getByRole('textbox', { name: /^Name/ }).fill(schema.name);
  await drawer
    .getByRole('textbox', { name: /^Description/ })
    .fill(schema.description);
};

/** The column editor commits on its check, not on blur. */
const commitField = async (field: ReturnType<Page['getByRole']>) => {
  await field
    .locator('xpath=ancestor::td[1]')
    .locator('button:has(.prefix__icon-tabler-check)')
    .click();
};

const addManualColumn = async (
  drawer: ReturnType<Page['getByRole']>,
  column: { name: string; type: string },
) => {
  const columns = drawer.getByRole('tabpanel', { name: /Schema Columns/ });
  await columns
    .getByRole('button', { name: 'Add Column', exact: true })
    .click();
  const name = columns.getByRole('textbox');
  await name.fill(column.name);
  await commitField(name);
  const type = columns.getByRole('combobox');
  await type.click();
  await drawer
    .page()
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .getByText(column.type, { exact: true })
    .click();
  await commitField(type);
};

const reviewAndCreate = async (page: Page, column: string) => {
  const drawer = page.getByRole('dialog');
  await drawer
    .getByRole('button', { name: 'Review Schema', exact: true })
    .click();
  const review = page.getByRole('dialog', { name: /Review Schema/ });
  await expect(
    review.getByRole('cell', { name: column, exact: true }),
  ).toBeVisible();
  await review
    .getByRole('button', { name: 'Create Schema', exact: true })
    .click();
  await expect(page.getByText('Schema created successfully')).toBeVisible({
    timeout: 30_000,
  });
};

const expectStoredSchema = async (page: Page, name: string, column: string) => {
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === SCHEMAS &&
      url.searchParams.get('schema_path') === `${HUNT}/${name}` &&
      url.searchParams.get('schema_version') === '1.0.0',
  );
  await expect(page.getByText(`${HUNT}/${name}.yml`)).toBeVisible();
  await expect(page.getByText(column, { exact: true }).first()).toBeVisible();
};

/** The current-version control commits on its check. */
const setCurrentVersion = async (
  page: Page,
  option: string,
  shown: string,
) => {
  const current = page
    .locator('dt')
    .filter({ hasText: 'Current Version:' })
    .locator('xpath=following-sibling::dd[1]');
  await current.getByRole('button').click();
  await current.getByRole('combobox').click();
  const choices = page
    .locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .locator('.ant-select-item-option-content');
  await expect(choices.first()).toBeVisible();
  const plain = choices.getByText(option, { exact: true });
  await (await plain.count()
    ? plain
    : choices.getByText(`${option} (Current)`, { exact: true })
  ).click();
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === 'PATCH' &&
      response.url().includes('/definitions/') &&
      response.ok(),
  );
  await current.locator('button:has(.prefix__icon-tabler-check)').click();
  await saved;
  await expect(current).toContainText(shown);
};

/** Hunt schemas sit under a collapsed folder, so the filter has to open it. */
const showInTree = async (page: Page, name: string) => {
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('textbox', { name: /Keyword/ }).fill(name);
  const listed = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      response.url().includes('/api/v1/schemas') &&
      response.url().includes(`search=${name}`) &&
      response.ok(),
  );
  await page
    .getByRole('button', { name: 'Apply Filters', exact: true })
    .click();
  await listed;
  await page.getByRole('tree').getByText(HUNT, { exact: true }).click();
  await expect(
    page.getByRole('tree').getByText(name, { exact: true }),
  ).toBeVisible();
};

const engineToken = async (request: APIRequestContext) => {
  const login = await request.post(`${ENGINE_API_URL}/api/v1/auth/login`, {
    data: { username: 'dfe_admin', password: adminPassword() },
  });
  expect(login.ok()).toBeTruthy();
  return (await login.json()).access_token as string;
};

/**
 * A schema written through the console stays after reset_all, so a rerun
 * removes the one this test is about to write. Missing is already clear.
 */
const forgetSchema = async (request: APIRequestContext, schemaPath: string) => {
  const token = await engineToken(request);
  const removed = await request.delete(
    `${ENGINE_API_URL}/api/v1/schemas/definitions/${schemaPath}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect([200, 204, 404]).toContain(removed.status());
};

test.describe('', { tag: ['@core', '@schema'] }, () => {
  test('a hunt schema typed by hand is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, `${HUNT}/manualhunt`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'manualhunt',
      description: 'Typed by hand',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');
    await expectStoredSchema(page, 'manualhunt', 'host_name');
  });

  test('a hunt schema read from a CSV is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, `${HUNT}/csvhunt`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'csvhunt',
      description: 'Read from a CSV',
    });
    await drawer.locator('input[type="file"]').setInputFiles({
      name: 'columns.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('name,type\nhost_name,string\n'),
    });
    await expect(drawer.getByText('host_name', { exact: true })).toBeVisible();
    await reviewAndCreate(page, 'host_name');
    await expectStoredSchema(page, 'csvhunt', 'host_name');
  });

  test('a hunt schema read from an Elastic index template is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, `${HUNT}/elastichunt`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'elastichunt',
      description: 'Read from an Elastic index template',
    });
    await drawer.getByText('ELASTIC INDEX TEMPLATE', { exact: true }).click();
    await expect(drawer.getByText('JSON File', { exact: true })).toBeVisible();
    await drawer.locator('input[type="file"]').setInputFiles({
      name: 'template.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          mappings: {
            properties: {
              host_name: { type: 'keyword' },
            },
          },
        }),
      ),
    });
    await expect(drawer.getByText('host_name', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await reviewAndCreate(page, 'host_name');
    await expectStoredSchema(page, 'elastichunt', 'host_name');
  });

  test('a hunt schema can be cloned', async ({ page, request }) => {
    await forgetSchema(request, `${HUNT}/clonehunt`);
    await forgetSchema(request, `${HUNT}/clonehunt_copy`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'clonehunt',
      description: 'Ready to clone',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await showInTree(page, 'clonehunt');
    const columns = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('clonehunt') &&
        response.url().includes('/versions/columns') &&
        response.url().includes('per_page=-1') &&
        response.ok(),
    );
    await page
      .getByRole('tree')
      .getByText('clonehunt', { exact: true })
      .hover();
    await page
      .getByRole('button', { name: 'Clone clonehunt', exact: true })
      .click();
    await columns;

    const clone = page.getByRole('dialog', { name: 'Clone clonehunt' });
    await expect(clone.getByRole('textbox', { name: /^Path/ })).toHaveValue(
      HUNT,
    );
    await expect(clone.getByRole('textbox', { name: /^Name/ })).toHaveValue(
      'clonehunt_copy',
    );
    await expect(
      clone.getByRole('textbox', { name: /^Description/ }),
    ).toHaveValue('Copy: clonehunt');
    await clone.getByRole('button', { name: 'Clone', exact: true }).click();

    await expect(
      page.getByRole('treeitem', { name: /clonehunt_copy/ }),
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  test('a hunt schema can be deleted', async ({ page, request }) => {
    await forgetSchema(request, `${HUNT}/deletehunt`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'deletehunt',
      description: 'Ready to delete',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await showInTree(page, 'deletehunt');
    await page
      .getByRole('tree')
      .getByText('deletehunt', { exact: true })
      .hover();
    // The row label is full width and takes a coordinate click, so activate
    // the button itself.
    await page
      .getByRole('button', {
        name: `Delete ${HUNT}/deletehunt`,
        exact: true,
        disabled: false,
      })
      .evaluate((button: HTMLButtonElement) => button.click());

    const confirm = page.getByRole('dialog', {
      name: `Delete ${HUNT}/deletehunt`,
    });
    await expect(
      confirm.getByText('Are you sure you want to delete this schema?'),
    ).toBeVisible();
    await confirm.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Schema deleted successfully')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      page.getByRole('tree').getByText('deletehunt', { exact: true }),
    ).toHaveCount(0);
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('schema_path') === null,
    );
  });

  test('a hunt schema version is added and becomes the current one', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, `${HUNT}/versionhunt`);
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'versionhunt',
      description: 'First version',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await page
      .getByRole('button', { name: 'Add Schema Version', exact: true })
      .click();
    const versionDrawer = page.getByRole('dialog', {
      name: 'Add Schema Version',
    });
    await versionDrawer
      .getByRole('textbox', { name: /^Description/ })
      .fill('Second version');
    const write = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        response.url().includes('/versions') &&
        response.ok(),
    );
    await versionDrawer
      .getByRole('button', { name: 'Review Schema Version', exact: true })
      .click();
    await page
      .getByRole('dialog', { name: /Review Schema Version/ })
      .getByRole('button', { name: 'Add Schema Version', exact: true })
      .click();

    const body = (await (await write).json()) as { current: string };
    expect(body.current).toMatch(/^\d+\.\d+\.\d+$/);
    expect(body.current).not.toBe('1.0.0');
    await expect(
      page.getByText('Schema created successfully').last(),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('schema_version') === body.current,
    );

    await showInTree(page, 'versionhunt');
    await page
      .getByRole('tree')
      .getByText('versionhunt', { exact: true })
      .click();
    const tree = page.getByRole('tree');
    await expect(tree.getByText('1.0.0', { exact: true })).toBeVisible();
    await expect(tree.getByText(body.current, { exact: true })).toBeVisible();
  });

  test('a core schema can change its current version and cannot gain one', async ({
    page,
  }) => {
    // Shipped hunt schemas are custom. The core file on this page is the timeseries header.
    await page.getByRole('button', { name: /^Filters/ }).click();
    await page.getByRole('textbox', { name: /Keyword/ }).fill('timeseries');
    const listed = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('/api/v1/schemas') &&
        response.url().includes('search=timeseries') &&
        response.ok(),
    );
    await page
      .getByRole('button', { name: 'Apply Filters', exact: true })
      .click();
    await listed;
    await page
      .getByRole('tree')
      .getByText('common-header', { exact: true })
      .click();
    const leaf = page
      .getByRole('tree')
      .getByText('timeseries', { exact: true });
    await expect(leaf).toBeVisible();
    await leaf.hover();
    await expect(
      page.getByRole('button', {
        name: 'Delete common-header/timeseries',
        exact: true,
      }),
    ).toHaveCount(0);
    await leaf.click();
    await expect(page.getByText('common-header/timeseries.yml')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add Schema Version', exact: true }),
    ).toBeDisabled();
    try {
      await setCurrentVersion(page, '1.0.0', '1.0.0');
    } finally {
      await setCurrentVersion(page, '1.0.3', '1.0.3');
    }
  });
});
