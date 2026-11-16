import { expect, Page, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { engine, forgetEngineToken } from '@e2e/config/engineApi.helpers';
import { loginAs } from '@e2e/config/login.helpers';

/**
 * A hunt's enabled state in the console: the actions menu turns it off and on,
 * an edit that leaves the switch alone keeps a disabled hunt disabled, and a
 * hunt the runner stopped shows why until Re-enable brings it back.
 *
 * The last case needs a hunt runner ticking against this engine with a hunt
 * whose SQL trips a ClickHouse limit. E2E_STOPPED_HUNT names that hunt, and the
 * case is skipped without it. It runs with no reset, because reset_all deletes
 * every hunt, that one included.
 */

const ORG = 'stopco';
const HUNT = 'stop_hunt';
const HUNT_LABEL = 'Stop Hunt';
const RULE = 'stop_rule';
const STOPPED = process.env.E2E_STOPPED_HUNT;
const SHOTS = 'test-results/hunt-enabled';

type HuntRow = {
  name: string;
  display_name: string | null;
  enabled: boolean;
  auto_disabled_at: number | null;
  auto_disabled_reason: string;
};

const deleteIfPresent = async (path: string) => {
  try {
    await engine('DELETE', path);
  } catch (error) {
    if (!String(error).includes('-> 404')) throw error;
  }
};

const huntRow = async (name: string): Promise<HuntRow> => {
  const page = await engine<{ items: HuntRow[] }>(
    'GET',
    `/api/v1/hunts?per_page=100&search=${name}`,
  );
  const row = page.items.find((item) => item.name === name);
  if (!row) throw new Error(`hunt ${name} is not in the list`);
  return row;
};

const openHunt = async (page: Page, name: string, label: string) => {
  await page.goto(`${BASE_URL}/hunts?name=${name}`);
  await expect(page.getByRole('heading', { name: label })).toBeVisible();
};

const listRow = (page: Page, label: string) =>
  page.getByRole('listitem').filter({ hasText: label });

// The menu stays open after a toggle, with its button renamed Close actions.
const openMenu = async (page: Page) => {
  const open = page.getByRole('button', { name: 'Close actions', exact: true });
  if ((await open.count()) === 0) {
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
  }
};

// The menu's own entry: the alert on an auto-disabled hunt has a button of the same name.
const menuAction = async (page: Page, action: string) => {
  await openMenu(page);
  await page
    .getByRole('button', { name: 'Close actions', exact: true })
    .locator('..')
    .getByRole('button', { name: action, exact: true })
    .click();
};

test.describe('A hunt made through the API', () => {
  test.beforeEach(async ({ playwright, page }) => {
    await e2eClient({ playwright, seedScript: 'reset_all' });
    await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
    await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
    forgetEngineToken();

    await deleteIfPresent(`/api/v1/hunts/${HUNT}`);
    await deleteIfPresent(`/api/v1/rules/${RULE}`);
    await engine('POST', '/api/v1/orgs', {
      name: ORG,
      display_name: 'Stop Co',
      org_ids: [`${ORG}-1`],
    });
    await engine('POST', '/api/v1/rules', {
      name: RULE,
      severity: 'medium',
      user_sql: "SELECT * FROM dfe.main WHERE _source = 'stop'",
      estimate_cost: false,
    });
    await engine('POST', '/api/v1/hunts', {
      name: HUNT,
      display_name: HUNT_LABEL,
      cron: '*/5 * * * *',
      log_buffer: 60,
      customers: [ORG],
      rules: [RULE],
      global_source_table_name: 'main',
    });

    await loginAs(page, 'dfe_admin');
  });

  test('Disable and enable from the actions menu', async ({ page }) => {
    await openHunt(page, HUNT, HUNT_LABEL);
    await expect(listRow(page, HUNT_LABEL).getByText('Disabled')).toHaveCount(
      0,
    );

    await menuAction(page, 'Disable Hunt');
    await expect(page.getByText(`Hunt ${HUNT_LABEL} disabled`)).toBeVisible();
    await expect(listRow(page, HUNT_LABEL).getByText('Disabled')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: HUNT_LABEL }).getByText('Disabled'),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/disabled.png` });
    expect((await huntRow(HUNT)).enabled).toBe(false);

    await menuAction(page, 'Enable Hunt');
    await expect(page.getByText(`Hunt ${HUNT_LABEL} enabled`)).toBeVisible();
    await expect(listRow(page, HUNT_LABEL).getByText('Disabled')).toHaveCount(
      0,
    );
    expect((await huntRow(HUNT)).enabled).toBe(true);
  });

  test('An edit that leaves the switch alone keeps a disabled hunt disabled', async ({
    page,
  }) => {
    await engine('PUT', `/api/v1/hunts/${HUNT}`, {
      display_name: HUNT_LABEL,
      cron: '*/5 * * * *',
      log_buffer: 60,
      customers: [ORG],
      rules: [RULE],
      global_source_table_name: 'main',
      enabled: false,
    });
    await openHunt(page, HUNT, HUNT_LABEL);
    await expect(listRow(page, HUNT_LABEL).getByText('Disabled')).toBeVisible();

    await menuAction(page, 'Edit Hunt');
    const drawer = page.getByRole('dialog');
    const enabled = drawer.getByRole('switch', { name: 'Enabled' });
    await expect(enabled).not.toBeChecked();
    await page.screenshot({ path: `${SHOTS}/edit-switch-off.png` });
    // The drawer's submit carries the drawer's own title.
    await drawer
      .getByRole('button', { name: 'Edit Hunt', exact: true })
      .click();
    await expect(drawer).toBeHidden();

    await expect(listRow(page, HUNT_LABEL).getByText('Disabled')).toBeVisible();
    expect((await huntRow(HUNT)).enabled).toBe(false);
  });
});

test.describe('A hunt the runner stopped', () => {
  // The reset above wiped the hunt's definition. Its stop marker is coordinator
  // state and survives, so the definition is put back and the marker shows again.
  test.beforeEach(async ({ page }) => {
    test.skip(!STOPPED, 'E2E_STOPPED_HUNT names no hunt a runner is stopping');
    forgetEngineToken();
    await deleteIfPresent(`/api/v1/hunts/${STOPPED}`);
    await engine('POST', '/api/v1/hunts', {
      name: STOPPED,
      display_name: 'Stopped Hunt',
      cron: '*/5 * * * *',
      log_buffer: 60,
      customers: [ORG],
      rules: [RULE],
      global_source_table_name: 'main',
    });
    await loginAs(page, 'dfe_admin');
  });

  test('shows why until Re-enable', async ({ page }) => {
    const name = STOPPED as string;
    await expect
      .poll(async () => (await huntRow(name)).auto_disabled_at, {
        timeout: 180_000,
        message: `the runner has not stopped ${name}`,
      })
      .not.toBeNull();
    const stopped = await huntRow(name);
    expect(stopped.auto_disabled_reason).toMatch(/^resource_limit:/);
    const label = stopped.display_name || name;

    await openHunt(page, name, label);
    const tag = listRow(page, label).getByText('Auto-disabled');
    await expect(tag).toBeVisible();
    await tag.hover();
    // The reason reaches the user as words, never as the API's code.
    await expect(page.getByRole('tooltip')).toContainText(
      /Auto-disabled by the hunt runner on .+ after hitting .+ repeatedly\./,
    );
    await expect(page.getByRole('tooltip')).not.toContainText(
      stopped.auto_disabled_reason,
    );
    await expect(
      page.getByRole('button', { name: /Trigger On-Demand/ }),
    ).toBeDisabled();
    await page.screenshot({ path: `${SHOTS}/auto-disabled.png` });

    const alertButton = page
      .getByRole('alert')
      .getByRole('button', { name: 'Re-enable Hunt', exact: true });
    await expect(alertButton).toBeVisible();
    await openMenu(page);
    await expect(
      page
        .getByRole('button', { name: 'Close actions', exact: true })
        .locator('..')
        .getByRole('button', { name: 'Re-enable Hunt', exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/auto-disabled-menu.png` });
    // The open menu sits over the alert, so it is closed before the alert's button is used.
    await page
      .getByRole('button', { name: 'Close actions', exact: true })
      .click();
    await alertButton.click();
    await expect(page.getByText(`Hunt ${label} enabled`)).toBeVisible();
    await expect(listRow(page, label).getByText('Auto-disabled')).toHaveCount(
      0,
    );
    expect((await huntRow(name)).auto_disabled_at).toBeNull();
  });
});
