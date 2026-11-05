import { Locator, Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Updating the platform system defaults, then checking config drift and
 * applying those defaults to a source.
 *
 * The seeded sources store a retention other than the deployment default and
 * stay undeployed, so applying the defaults reports the table as not deployed.
 * The retention this spec changes is put back afterwards.
 */

const SEEDED_SOURCE = 'searchable-default-0';

test.setTimeout(240_000);

test.beforeEach(async ({ playwright, page }) => {
  // The dev indicator sits on the menu and the drawer and takes the click.
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

const openPlatform = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/platform`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/platform`);
};

const retentionLabel = (days: number) =>
  days === 0 ? 'none (kept forever)' : `${days} days`;

const shownRetention = (page: Page) =>
  page
    .getByText('Default Retention', { exact: true })
    .locator('xpath=following-sibling::dd[1]');

const readRetention = async (page: Page) => {
  const text = (await shownRetention(page).innerText()).trim();
  return text.startsWith('none') ? 0 : Number(text.replace(' days', ''));
};

const closeDrift = async (drawer: Locator) => {
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(drawer).toBeHidden();
};

const setRetention = async (page: Page, days: number) => {
  const actions = page.getByRole('button', { name: 'System defaults actions' });
  await actions.scrollIntoViewIfNeeded();
  await actions.click();
  await page
    .getByRole('button', { name: 'Edit Defaults', exact: true })
    .click();

  const ttl = page.getByRole('spinbutton', { name: 'Default Retention' });
  await ttl.click();
  await page.keyboard.press('ControlOrMeta+A');
  // One insert, so a controlled number field cannot keep only the last digit.
  await page.keyboard.insertText(String(days));
  await expect(ttl).toHaveValue(String(days));
  const update = page.getByRole('button', { name: 'Update', exact: true });
  await expect(update).toBeEnabled();
  const saved = page.getByText('Common header defaults updated successfully');
  if (await saved.isVisible()) {
    await expect(saved).toBeHidden();
  }
  await update.click();

  // Saving the override commits it, which outlasts the default expect.
  await expect(saved).toBeVisible({ timeout: 60_000 });
  await expect(shownRetention(page)).toHaveText(retentionLabel(days));

  const drawer = page.getByRole('dialog', { name: 'Identify Config Drift' });
  await expect(drawer).toBeVisible();
  return drawer;
};

const openDrift = async (page: Page) => {
  await openPlatform(page);
  const actions = page.getByRole('button', { name: 'System defaults actions' });
  await actions.scrollIntoViewIfNeeded();
  await actions.click();
  await page
    .getByRole('button', { name: 'Identify Config Drift', exact: true })
    .click();
  const drawer = page.getByRole('dialog', { name: 'Identify Config Drift' });
  await expect(drawer).toBeVisible();
  return drawer;
};

test.describe('', { tag: [TAGS.core, TAGS.settings] }, () => {
  test('user can update the platform system defaults', async ({ page }) => {
    await openPlatform(page);
    const current = await readRetention(page);
    const next = current >= 365 ? current - 1 : current + 1;

    const drawer = await setRetention(page, next);
    await closeDrift(drawer);

    const restored = await setRetention(page, current);
    await closeDrift(restored);
    await expect(shownRetention(page)).toHaveText(retentionLabel(current));
  });

  test('user can check config drift and apply it to a source', async ({
    playwright,
    page,
  }) => {
    await e2eClient({
      playwright,
      seedScript: 'seed_searchable_system_defaults',
    });
    const drawer = await openDrift(page);

    await drawer.getByPlaceholder('Search sources').fill(SEEDED_SOURCE);
    const row = drawer.getByRole('row', { name: SEEDED_SOURCE });
    await expect(row.getByText('Drift', { exact: true }).first()).toBeVisible();
    await row.getByRole('checkbox').check();
    await expect(drawer.getByText('1 selected')).toBeVisible();

    await drawer
      .getByRole('button', { name: 'Update Configurations', exact: true })
      .click();

    await expect(
      drawer.getByText('Applied 1 defaults and 0 unchanged'),
    ).toBeVisible();
    await expect(drawer.getByText('Source Configs Updated')).toBeVisible();
    await expect(
      drawer.getByText('Not deployed', { exact: true }),
    ).toBeVisible();
    await expect(
      drawer.getByRole('row', { name: SEEDED_SOURCE }).first(),
    ).toBeVisible();
  });
});
