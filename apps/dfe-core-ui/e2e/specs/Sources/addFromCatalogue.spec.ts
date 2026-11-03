import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

/**
 * Creating a source from an installed catalogue entry.
 *
 * Okta arrives by Beats first. The console keeps that intake and names the
 * source after the entry, so the stored source is `okta`.
 */

const ENTRY = 'okta';
const DISPLAY_NAME = 'okta.system';

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

test.describe('', { tag: ['@core', '@source'] }, () => {
  test('user can add a source from the catalogue', async ({ page }) => {
    await page.goto(`${BASE_URL}/sources`);
    await page
      .getByRole('button', { name: 'Add from catalogue', exact: true })
      .click();

    const drawer = page.getByRole('dialog', { name: 'Add from catalogue' });
    await drawer.getByPlaceholder('Search by name or dataset').fill(ENTRY);

    const row = drawer.getByRole('row').filter({ hasText: 'okta.system' });
    await row.getByRole('checkbox', { name: /Select row/ }).check();
    await drawer
      .getByRole('button', { name: 'Review Catalogues', exact: true })
      .click();

    await expect(drawer.getByText('1 entries selected')).toBeVisible();
    await expect(
      drawer.getByRole('row', { name: 'Remove okta okta okta beats bus' }),
    ).toBeVisible();

    await drawer
      .getByRole('button', { name: 'Upload Catalogues', exact: true })
      .click();

    await expect(drawer.getByText('1 source created')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      drawer.getByRole('cell', { name: ENTRY, exact: true }),
    ).toHaveCount(2);

    const popupPromise = page.waitForEvent('popup');
    await drawer
      .getByRole('link', { name: 'View Source', exact: true })
      .click();
    const sourcePage = await popupPromise;

    await expect(sourcePage).toHaveURL(
      (url) => url.searchParams.get('source_name') === ENTRY,
    );
    await expect(
      sourcePage.getByRole('heading', { name: new RegExp(DISPLAY_NAME) }),
    ).toBeVisible();
    await expect(
      sourcePage.getByTestId(`source-tree-item-${ENTRY}`),
    ).toBeVisible();
  });
});
