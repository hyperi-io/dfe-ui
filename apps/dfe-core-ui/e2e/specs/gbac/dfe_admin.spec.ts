import { test } from '@playwright/test';
import { e2eClient } from '../../config/e2e.client';

import { BASE_URL } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

test('GBAC - DFE Admin', async ({ page }) => {
  await page.goto(BASE_URL);
});
