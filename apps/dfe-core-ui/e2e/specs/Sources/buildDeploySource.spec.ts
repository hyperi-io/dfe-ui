import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import {
  clickhouse,
  forgetDeployRecords,
  forgetEngineToken,
  qualifiedTable,
} from '@e2e/config/engineApi.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Building and deploying a receiver source onto its own table.
 *
 * The syslog meta schema has one version, so choosing it fills the version.
 * A shared-table source has no DDL to build.
 */

const SOURCE = 'testdeploy';

/** Build and plan both reach ClickHouse. */
const PLAN_TIMEOUT = 30_000;

test.setTimeout(90_000);

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
  forgetEngineToken();
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  // reset_all clears the registry and leaves the warehouse and deploy records.
  await clickhouse(`DROP TABLE IF EXISTS ${await qualifiedTable(SOURCE)}`);
  await forgetDeployRecords(SOURCE);
  await loginAs(page, 'dfe_admin');
});

test.describe('Build and deploy', { tag: [TAGS.core, TAGS.source] }, () => {
  test('user can build and deploy a source', async ({ page }) => {
    await page.goto(`${BASE_URL}/sources`);
    await page.getByRole('button', { name: 'Add Source', exact: true }).click();
    const drawer = page.getByRole('dialog', { name: 'Add Source' });

    await drawer.getByRole('textbox', { name: /Source Name/ }).fill(SOURCE);
    await drawer
      .getByRole('textbox', { name: /Display Name/ })
      .fill('Test Deploy');
    await drawer.getByRole('textbox', { name: /^Field/ }).fill('_json.data');
    await drawer
      .getByRole('textbox', { name: /^Value/ })
      .fill('deploy-use-case');
    await drawer.getByRole('radio', { name: 'Own table', exact: true }).check();

    await drawer.getByRole('tab', { name: 'Table Settings' }).click();
    await page.locator('#schema_meta_schema').click();
    await page.keyboard.type('syslog');
    await page.getByRole('option', { name: 'syslog', exact: true }).click();
    const version = page
      .locator('.ant-select')
      .filter({ has: page.locator('#schema_meta_schema_version') });
    await expect(version).toContainText('1.0.0');

    await drawer
      .getByRole('button', { name: 'Add Source', exact: true })
      .click();
    await expect(page.getByText('Source created successfully')).toBeVisible({
      timeout: PLAN_TIMEOUT,
    });
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('source_name') === SOURCE,
    );

    await page
      .getByRole('button', { name: 'Go to Build & Deploy', exact: true })
      .click();
    await expect(
      page.getByRole('tab', { name: 'Build & Deploy', selected: true }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Build', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Generated DDL' })).toBeVisible({
      timeout: PLAN_TIMEOUT,
    });
    await expect(page.getByText('No DDL generated for source:')).toHaveCount(0);
    await expect(page.getByText(`Deploy ${SOURCE}@1.0.0`)).toBeVisible();

    await page.getByRole('button', { name: 'Deploy', exact: true }).click();
    const plan = page.getByRole('dialog', { name: 'Deploy Source' });
    await expect(plan.getByText('Review Deploy Plan')).toBeVisible({
      timeout: PLAN_TIMEOUT,
    });
    await plan.getByRole('button', { name: 'Deploy', exact: true }).click();

    await expect(page.getByText('Selected version is deployed')).toBeVisible({
      timeout: PLAN_TIMEOUT,
    });
    await expect(
      page.getByText('There are undeployed changes on the working branch'),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', {
        name: `${SOURCE}: undeployed changes, open Build & Deploy`,
      }),
    ).toHaveCount(0);
  });
});
