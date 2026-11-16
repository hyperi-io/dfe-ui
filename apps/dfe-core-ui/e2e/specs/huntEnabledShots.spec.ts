import { mkdirSync, writeFileSync } from 'node:fs';

import { expect, Page, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { engine, forgetEngineToken } from '@e2e/config/engineApi.helpers';
import { loginAs } from '@e2e/config/login.helpers';

/**
 * Usability evidence for the hunt enabled state: screenshots and aria
 * snapshots of the list row tag, the header, the Enabled switch, the stop alert
 * and the Re-enable flow, in light and dark at 1920 and 1280.
 *
 * E2E_STOPPED_HUNT names a hunt the runner (or its coordinator) stopped before
 * the run. Without it the stop states are skipped. The last pass re-enables it.
 */

const ORG = 'shotco';
const DISABLED = 'shot_disabled';
const DISABLED_LABEL = 'Shot Disabled';
const RULE = 'shot_rule';
const STOPPED = process.env.E2E_STOPPED_HUNT;
const OUT = 'test-results/hunt-shots';

const THEMES = ['light', 'dark'] as const;
const WIDTHS = [1920, 1280] as const;

const deleteIfPresent = async (path: string) => {
  try {
    await engine('DELETE', path);
  } catch (error) {
    if (!String(error).includes('-> 404')) throw error;
  }
};

const huntBody = (label: string) => ({
  display_name: label,
  cron: '*/5 * * * *',
  log_buffer: 60,
  customers: [ORG],
  rules: [RULE],
  global_source_table_name: 'main',
});

// The whole body, so a drawer or a tooltip rendered in a portal is in the tree.
// Animations are run to their end first, so a drawer or tooltip is never caught mid-slide.
const capture = async (page: Page, name: string) => {
  await page.screenshot({ path: `${OUT}/${name}.png`, animations: 'disabled' });
  const aria = await page.locator('body').ariaSnapshot();
  writeFileSync(`${OUT}/${name}.aria.yaml`, aria);
};

// The actions menu's own entry, as the alert carries a button of the same name.
const menuButton = (page: Page, name: string) =>
  page
    .getByRole('button', { name: 'Close actions', exact: true })
    .locator('..')
    .getByRole('button', { name, exact: true });

// The drawer has finished opening once its last control, the submit button, is
// on screen. The form is scrolled to it, so the alert, the switch and the
// button are in the shot at the smaller height too.
const settledDrawer = async (page: Page) => {
  const drawer = page.getByRole('dialog');
  const submit = drawer.getByRole('button', { name: 'Edit Hunt', exact: true });
  await expect(drawer.getByRole('switch', { name: 'Enabled' })).toBeVisible();
  await expect(submit).toBeVisible();
  await submit.scrollIntoViewIfNeeded();
  return drawer;
};

const openHunt = async (page: Page, name: string, label: string) => {
  await page.goto(`${BASE_URL}/hunts?name=${name}`);
  await expect(
    page.getByRole('heading', { name: new RegExp(label) }),
  ).toBeVisible();
};

const openMenu = async (page: Page) => {
  const open = page.getByRole('button', { name: 'Close actions', exact: true });
  if ((await open.count()) === 0) {
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
  }
};

// The toggle adds or removes the `dark` class on the root once it has taken.
const setTheme = async (page: Page, theme: (typeof THEMES)[number]) => {
  const toggle = page.getByRole('button', { name: `Switch to ${theme} mode` });
  if ((await toggle.count()) > 0) {
    await toggle.click();
  }
  const root = page.locator('html');
  if (theme === 'dark') {
    await expect(root).toHaveClass(/dark/);
  } else {
    await expect(root).not.toHaveClass(/dark/);
  }
};

test.beforeEach(async ({ playwright, page }) => {
  mkdirSync(OUT, { recursive: true });
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  forgetEngineToken();
  await deleteIfPresent(`/api/v1/hunts/${DISABLED}`);
  await deleteIfPresent(`/api/v1/rules/${RULE}`);
  await engine('POST', '/api/v1/orgs', {
    name: ORG,
    display_name: 'Shot Co',
    org_ids: [`${ORG}-1`],
  });
  await engine('POST', '/api/v1/rules', {
    name: RULE,
    severity: 'medium',
    user_sql: "SELECT * FROM dfe.main WHERE _source = 'shot'",
    estimate_cost: false,
  });
  await engine('POST', '/api/v1/hunts', {
    name: DISABLED,
    ...huntBody(DISABLED_LABEL),
  });
  await engine('PUT', `/api/v1/hunts/${DISABLED}`, {
    ...huntBody(DISABLED_LABEL),
    enabled: false,
  });
  if (STOPPED) {
    await deleteIfPresent(`/api/v1/hunts/${STOPPED}`);
    await engine('POST', '/api/v1/hunts', {
      name: STOPPED,
      ...huntBody('Shot Stopped'),
    });
  }
  await loginAs(page, 'dfe_admin');
});

test('the enabled state in every theme and width', async ({ page }) => {
  test.setTimeout(600_000);
  for (const theme of THEMES) {
    for (const width of WIDTHS) {
      await page.setViewportSize({
        width,
        height: width === 1920 ? 1080 : 800,
      });
      const tag = `${theme}-${width}`;

      await openHunt(page, DISABLED, DISABLED_LABEL);
      await setTheme(page, theme);
      // A disabled hunt fires nothing, so the on-demand trigger is off with its reason.
      const trigger = page.getByRole('button', { name: /Trigger On-Demand/ });
      await expect(trigger).toBeDisabled();
      await trigger.hover({ force: true });
      await expect(page.getByRole('tooltip')).toBeVisible();
      await capture(page, `${tag}-disabled`);
      await openMenu(page);
      await expect(menuButton(page, 'Enable Hunt')).toBeVisible();
      await capture(page, `${tag}-disabled-menu`);
      await menuButton(page, 'Edit Hunt').click();
      const drawer = await settledDrawer(page);
      await expect(
        drawer.getByRole('switch', { name: 'Enabled' }),
      ).not.toBeChecked();
      await capture(page, `${tag}-disabled-edit`);
      await drawer.getByRole('button', { name: 'Close' }).click();
      await expect(drawer).toBeHidden();

      if (!STOPPED) continue;
      await openHunt(page, STOPPED, 'Shot Stopped');
      const stopTag = page
        .getByRole('listitem')
        .filter({ hasText: 'Shot Stopped' })
        .getByText('Auto-disabled');
      await expect(stopTag).toBeVisible();
      await expect(
        page.getByRole('alert').getByRole('button', { name: 'Re-enable Hunt' }),
      ).toBeVisible();
      await stopTag.hover();
      await expect(page.getByRole('tooltip')).toBeVisible();
      await capture(page, `${tag}-stopped-tooltip`);
      await openMenu(page);
      await expect(menuButton(page, 'Re-enable Hunt')).toBeVisible();
      await capture(page, `${tag}-stopped-menu`);
      await menuButton(page, 'Edit Hunt').click();
      const stopDrawer = await settledDrawer(page);
      await expect(stopDrawer.getByRole('alert')).toBeVisible();
      await expect(
        stopDrawer.getByRole('switch', { name: 'Enabled' }),
      ).not.toBeChecked();
      await capture(page, `${tag}-stopped-edit`);
      await stopDrawer.getByRole('button', { name: 'Close' }).click();
      await expect(stopDrawer).toBeHidden();
    }
  }
  if (STOPPED) {
    await openHunt(page, STOPPED, 'Shot Stopped');
    await page
      .getByRole('alert')
      .getByRole('button', { name: 'Re-enable Hunt' })
      .click();
    await expect(page.getByText('Hunt Shot Stopped enabled')).toBeVisible();
    // The settled state: the tag has gone from the row and the header.
    await expect(page.getByText('Auto-disabled')).toHaveCount(0);
    await capture(page, 'dark-1280-reenabled');
  }
});
