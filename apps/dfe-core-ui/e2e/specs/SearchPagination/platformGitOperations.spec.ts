import { Page, expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';
import { TAGS } from '../../config/tags.constants';

/**
 * The log pages fifty at a time, newest first. Reset commits land above the
 * seeded operations, so the next page is whichever commits those fifty push down.
 */
const NEWEST = 'searchable-49';
const FIRST_PAGE = 50;

test.setTimeout(120_000);

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({
    playwright,
    seedScript: 'seed_searchable_git_operation_logs',
  });
  await loginAs(page, 'dfe_admin');
});

const openGitOperations = async (page: Page) => {
  await page.goto(`${BASE_URL}/settings/platform/gitops`);
  await expect(page).toHaveURL(`${BASE_URL}/settings/platform/gitops`);
};

/** The next page loads when the sentinel under the last card scrolls into view. */
const scrollLogToEnd = async (page: Page) => {
  const log = page.getByText('Git Operations: Log', { exact: true });
  await log.evaluate((node) => {
    let scroller = node.parentElement;
    while (scroller) {
      const overflow = getComputedStyle(scroller).overflowY;
      if (overflow === 'auto' || overflow === 'scroll') {
        scroller.scrollTop = scroller.scrollHeight;
        return;
      }
      scroller = scroller.parentElement;
    }
  });
};

test.describe('', { tag: [TAGS.core, TAGS.pagination] }, () => {
  test('Scrolling the log loads the next page', async ({ page }) => {
    await openGitOperations(page);

    const cards = page.getByText('Summary', { exact: true });
    await expect(page.getByText(NEWEST, { exact: true })).toBeVisible();
    await expect(cards).toHaveCount(FIRST_PAGE);

    await expect(async () => {
      await scrollLogToEnd(page);
      expect(await cards.count()).toBeGreaterThan(FIRST_PAGE);
    }).toPass();
  });
});
