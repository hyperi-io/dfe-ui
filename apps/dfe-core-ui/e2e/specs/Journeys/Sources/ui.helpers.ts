import { Page, expect } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';

export const PLAN_TIMEOUT = 45_000;

/** Add Source drawer, filled the way a user fills it. */
export const addSourceInUi = async (
  page: Page,
  s: {
    name: string;
    display: string;
    field: string;
    value: string;
    ownTable: boolean;
    metaSchema?: string;
    description?: string;
  },
) => {
  await page.goto(`${BASE_URL}/sources`);
  await page.getByRole('button', { name: 'Add Source', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Add Source' });
  await drawer.getByRole('textbox', { name: /Source Name/ }).fill(s.name);
  await drawer.getByRole('textbox', { name: /Display Name/ }).fill(s.display);
  if (s.description) {
    await drawer
      .getByRole('textbox', { name: /Description/ })
      .fill(s.description);
  }
  await drawer.getByRole('textbox', { name: /^Field/ }).fill(s.field);
  await drawer.getByRole('textbox', { name: /^Value/ }).fill(s.value);
  await drawer
    .getByRole('radio', {
      name: s.ownTable ? 'Own table' : 'Shared table',
      exact: true,
    })
    .check();
  if (s.metaSchema) {
    await drawer.getByRole('tab', { name: 'Table Settings' }).click();
    await page.locator('#schema_meta_schema').click();
    await page.keyboard.type(s.metaSchema);
    await page.getByRole('option', { name: s.metaSchema, exact: true }).click();
    await expect(page.locator('.ant-select-dropdown:visible')).toHaveCount(0);
    const version = page
      .locator('.ant-select')
      .filter({ has: page.locator('#schema_meta_schema_version') });
    if (!(await version.innerText()).match(/\d+\.\d+\.\d+/)) {
      await version.click();
      await page
        .locator('.ant-select-dropdown:visible .ant-select-item-option-content')
        .last()
        .click();
    }
    await drawer
      .getByRole('tab', { name: 'Configuration', exact: true })
      .click();
  }
  return drawer;
};

export const submitDrawer = async (
  page: Page,
  drawer: ReturnType<Page['getByRole']>,
) => {
  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(page.getByText('Source created successfully')).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
};

/** Build and deploy from the Build & Deploy tab. Returns the deploy response body. */
export const buildAndDeployInUi = async (page: Page, name: string) => {
  await page
    .getByRole('button', { name: 'Go to Build & Deploy', exact: true })
    .click();
  await page.getByRole('button', { name: 'Build', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Generated DDL' })).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  await page.getByRole('button', { name: 'Deploy', exact: true }).click();
  const plan = page.getByRole('dialog', { name: 'Deploy Source' });
  await expect(plan.getByText('Review Deploy Plan')).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  const deployed = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      new URL(r.url()).pathname === `/api/v1/sources/${name}/deploy` &&
      new URL(r.url()).searchParams.get('dry_run') !== 'true',
  );
  await plan.getByRole('button', { name: 'Deploy', exact: true }).click();
  await expect(page.getByText('Selected version is deployed')).toBeVisible({
    timeout: PLAN_TIMEOUT,
  });
  return (await (await deployed).json()) as Record<string, unknown>;
};
