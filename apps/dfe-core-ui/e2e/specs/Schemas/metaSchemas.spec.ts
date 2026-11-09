import path from 'node:path';

import { APIRequestContext, Page, expect, test } from '@playwright/test';

import { BASE_URL, ENGINE_API_URL, e2eClient } from '@e2e/config/e2e.client';
import { adminPassword, loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

const MOCKS = path.join(__dirname, '../../mocks');

/**
 * Meta schemas from the schemas page: typed by hand, read from a CSV, read
 * from an Elastic index template, then cloned, deleted, versioned and used as
 * the base of a derived schema.
 *
 * A schema name is letters, numbers and underscores. The registry path the
 * console stores is meta/<name>. Login compiles the landing page, and each
 * save reviews before it writes, so the 30s default ends the test first.
 */

const SCHEMAS = '/schemas/meta-schemas';

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
  return page.getByRole('dialog', { name: 'Add Schema' });
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
      url.searchParams.get('schema_path') === `meta/${name}` &&
      url.searchParams.get('schema_version') === '1.0.0',
  );
  await expect(page.getByText(`meta/${name}.yml`)).toBeVisible();
  await expect(page.getByText(column, { exact: true }).first()).toBeVisible();
};

/** The current-version control commits on its check. */
const setCurrentVersion = async (page: Page, option: string, shown: string) => {
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
  await (
    (await plain.count())
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

/** The tree lists every shipped schema, so the one just written is filtered into view. */
const showInTree = async (page: Page, name: string) => {
  await page.getByRole('button', { name: /^Filters/ }).click();
  await page.getByRole('textbox', { name: /Keyword/ }).fill(name);
  await page
    .getByRole('button', { name: 'Apply Filters', exact: true })
    .click();
  await expect(page.getByText(name, { exact: true })).toBeVisible();
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

test.describe('', { tag: [TAGS.core, TAGS.schema] }, () => {
  test('a meta schema typed by hand is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'meta/manualmeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'manualmeta',
      description: 'Typed by hand',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');
    await expectStoredSchema(page, 'manualmeta', 'host_name');
  });

  test('a meta schema read from a CSV is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'meta/csvmeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'csvmeta',
      description: 'Read from a CSV',
    });
    await drawer
      .locator('input[type="file"]')
      .setInputFiles(path.join(MOCKS, 'csvUpload.csv'));
    await expect(drawer.getByText('alert_uid', { exact: true })).toBeVisible();
    await reviewAndCreate(page, 'alert_uid');
    await expectStoredSchema(page, 'csvmeta', 'alert_uid');
  });

  test('a meta schema read from an Elastic index template is stored and shown', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'meta/elasticmeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'elasticmeta',
      description: 'Read from an Elastic index template',
    });
    await drawer.getByText('ELASTIC INDEX TEMPLATE', { exact: true }).click();
    await expect(drawer.getByText('JSON File', { exact: true })).toBeVisible();
    await drawer
      .locator('input[type="file"]')
      .setInputFiles(path.join(MOCKS, 'elasticUpload.json'));
    await expect(drawer.getByText('tags', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await reviewAndCreate(page, 'tags');
    await expectStoredSchema(page, 'elasticmeta', 'tags');
  });

  test('a meta schema can be cloned', async ({ page, request }) => {
    await forgetSchema(request, 'meta/clonemeta');
    await forgetSchema(request, 'meta/clonemeta_copy');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'clonemeta',
      description: 'Ready to clone',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await showInTree(page, 'clonemeta');
    const columns = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        response.url().includes('clonemeta') &&
        response.url().includes('/versions/columns') &&
        response.url().includes('page_size=1000') &&
        response.ok(),
    );
    await page.getByText('clonemeta', { exact: true }).hover();
    await page
      .getByRole('button', { name: 'Clone clonemeta', exact: true })
      .click();
    await columns;

    const clone = page.getByRole('dialog', { name: 'Clone clonemeta' });
    await expect(clone.getByRole('textbox', { name: /^Name/ })).toHaveValue(
      'clonemeta_copy',
    );
    await expect(
      clone.getByRole('textbox', { name: /^Description/ }),
    ).toHaveValue('Copy: clonemeta');
    await clone.getByRole('button', { name: 'Clone', exact: true }).click();

    // The filter already matches both names. The notice text also sits in a
    // hidden node, so the copy in the tree is the confirmation.
    await expect(
      page.getByRole('treeitem', { name: /clonemeta_copy/ }),
    ).toBeVisible({
      timeout: 30_000,
    });
  });

  test('a meta schema can be deleted', async ({ page, request }) => {
    await forgetSchema(request, 'meta/deletemeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'deletemeta',
      description: 'Ready to delete',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await showInTree(page, 'deletemeta');
    await page.getByText('deletemeta', { exact: true }).hover();
    // The row label is full width and sits over the hover action.
    await page
      .getByRole('button', { name: 'Delete meta/deletemeta', exact: true })
      .click({ force: true });

    const confirm = page.getByRole('dialog', {
      name: 'Delete meta/deletemeta',
    });
    await expect(
      confirm.getByText('Are you sure you want to delete this schema?'),
    ).toBeVisible();
    await confirm.getByRole('button', { name: 'Delete', exact: true }).click();

    await expect(page.getByText('Schema deleted successfully')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText('deletemeta', { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('schema_path') === null,
    );
  });

  test('a schema version is added and becomes the current one', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'meta/versionmeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'versionmeta',
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

    await showInTree(page, 'versionmeta');
    await page.getByText('versionmeta', { exact: true }).click();
    const tree = page.getByRole('tree');
    await expect(tree.getByText('1.0.0', { exact: true })).toBeVisible();
    await expect(tree.getByText(body.current, { exact: true })).toBeVisible();
  });

  test('a derived schema keeps the columns chosen from its base', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'derived/derivedmeta');
    await forgetSchema(request, 'meta/basemeta');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'basemeta',
      description: 'Base for a derived schema',
    });
    await addManualColumn(drawer, { name: 'host_name', type: 'String' });
    await reviewAndCreate(page, 'host_name');

    await page
      .getByRole('button', { name: 'Add Derived Schema', exact: true })
      .click();
    const derived = page.getByRole('dialog', { name: 'Create Derived Schema' });
    await derived.getByRole('textbox', { name: /^Name/ }).fill('derivedmeta');
    await derived
      .getByRole('textbox', { name: /^Description/ })
      .fill('host_name only');
    await derived.getByRole('combobox', { name: /Base Meta Schema/ }).click();
    await derived
      .getByRole('combobox', { name: /Base Meta Schema/ })
      .fill('basemeta');
    await page
      .locator('.ant-select-dropdown:visible')
      .getByText('meta/basemeta', { exact: true })
      .click();
    await expect(
      derived.locator('.ant-form-item').filter({ hasText: 'Base Version' }),
    ).toContainText('1.0.0');
    const column = derived.getByRole('row').filter({ hasText: 'host_name' });
    await expect(column).toBeVisible({ timeout: 30_000 });
    await column.locator('.ant-checkbox').click();
    await derived.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(
      page.getByText('Derived schema created successfully'),
    ).toBeVisible({ timeout: 30_000 });

    const token = await engineToken(request);
    const stored = await request.get(
      `${ENGINE_API_URL}/api/v1/schemas/definitions/derived/derivedmeta`,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    expect(stored.ok()).toBeTruthy();
    const body = (await stored.json()) as {
      path: string;
      base: string;
      base_version: string;
      current: string;
      versions: Record<string, { select: { name: string }[] }>;
    };
    expect(body).toMatchObject({
      path: 'derived/derivedmeta',
      base: 'meta/basemeta',
      base_version: '1.0.0',
      current: '1.0.0',
    });
    expect(body.versions['1.0.0']?.select).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'host_name' })]),
    );
  });

  test('a core meta schema can change its current version and cannot gain one', async ({
    page,
  }) => {
    await showInTree(page, 'syslog');
    const leaf = page.getByRole('tree').getByText('syslog', { exact: true });
    await leaf.hover();
    await expect(
      page.getByRole('button', { name: 'Delete meta/syslog', exact: true }),
    ).toHaveCount(0);
    await leaf.click();
    await expect(page.getByText('meta/syslog.yml')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Add Schema Version', exact: true }),
    ).toBeDisabled();
    await setCurrentVersion(page, '1.0.0', '1.0.0');
  });
});
