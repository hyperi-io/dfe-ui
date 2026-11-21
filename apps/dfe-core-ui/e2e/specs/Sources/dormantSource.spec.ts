import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '@e2e/config/e2e.client';
import { engine, forgetEngineToken } from '@e2e/config/engineApi.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * A dormant source keeps its table and receiver match while routing and
 * transforms stop. The console names it Dormant, not Disabled, and a mouse user
 * can still enable it.
 *
 * jsdom has no layout, so only a real browser shows whether the hint covers the
 * Enable Source button: Playwright's click waits for the button to receive it.
 */

const SOURCE = 'undeployedsource';

const HINT = /^Dormant: the table and the receiver match are kept/;

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  forgetEngineToken();
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await e2eClient({ playwright, seedScript: 'seed_undeployed_source' });
  await engine('PATCH', `/api/v1/sources/${SOURCE}`, { state: 'dormant' });
  await loginAs(page, 'dfe_admin');
  await page.goto(`${BASE_URL}/sources`);
  await page.getByTestId(`source-tree-item-${SOURCE}`).click();
});

test.describe('', { tag: [TAGS.core, TAGS.source] }, () => {
  test('a dormant source reads Dormant, not Disabled, with a hint', async ({
    page,
  }) => {
    const chip = page.getByRole('button', { name: 'Dormant', exact: true });

    await expect(chip).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Disabled', exact: true }),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: `${SOURCE}: source is dormant` }),
    ).toBeVisible();

    await chip.hover();
    await expect(page.getByText(HINT)).toBeVisible();
  });

  test('a mouse user can enable a dormant source', async ({ page }) => {
    const chip = page.getByRole('button', { name: 'Dormant', exact: true });

    // The pointer stays on the chip, where the hint opens, as it does for a user.
    await chip.hover();
    await expect(page.getByText(HINT)).toBeVisible();
    await chip.click();
    const enable = page.getByRole('button', {
      name: 'Enable Source',
      exact: true,
    });
    await expect(enable).toBeVisible();
    await expect(page.getByText(HINT)).toBeHidden();

    await enable.click({ timeout: 10_000 });

    await expect(
      page.getByRole('button', { name: 'Enabled', exact: true }),
    ).toBeVisible();
    const detail = await engine<{ state: string }>(
      'GET',
      `/api/v1/sources/${SOURCE}`,
    );
    expect(detail.state).toBe('active');
  });
});
