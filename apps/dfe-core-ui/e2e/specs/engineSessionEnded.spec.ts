import { expect, test } from '@playwright/test';

import { BASE_URL, ENGINE_API_URL, e2eClient } from '../config/e2e.client';
import { expectLoggedOut, loginAs } from '../config/login.helpers';

const SIGN_OUT_PATH = '/api/auth/signout';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  await loginAs(page, 'dfe_admin');
});

test('a session the engine ended signs out once and lands on the login form', async ({
  page,
  context,
  request,
}) => {
  // The quiet window below is spent on top of a full sign-in.
  test.slow();
  const engineToken = (await context.cookies()).find(
    (cookie) => cookie.name === 'dfe_token',
  );
  expect(engineToken).toBeDefined();

  // End the engine session behind the console, as a restart with a new key or a revocation does.
  const logout = await request.post(`${ENGINE_API_URL}/api/v1/auth/logout`, {
    headers: { Authorization: `Bearer ${engineToken?.value}` },
  });
  expect(logout.ok()).toBeTruthy();

  let signOuts = 0;
  page.on('request', (req) => {
    if (
      req.method() === 'POST' &&
      new URL(req.url()).pathname === SIGN_OUT_PATH
    ) {
      signOuts += 1;
    }
  });

  await page.goto(`${BASE_URL}/sources`);
  await expectLoggedOut(page);
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

  // A looping client would keep signing out while the login form sits there.
  await page.waitForTimeout(5000);
  expect(signOuts).toBe(1);
  const names = (await context.cookies()).map((cookie) => cookie.name);
  expect(names).not.toContain('next-auth.session-token');
  expect(names).not.toContain('dfe_token');
});
