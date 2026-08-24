import { test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_infra_user' });
  await loginAs(page, 'dfe_infra');
});

test('GBAC - DFE Infra', async ({ page }) => {
  await page.goto(BASE_URL);
});
