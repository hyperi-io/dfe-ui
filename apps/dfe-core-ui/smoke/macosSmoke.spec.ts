import { expect, test, type Page } from '@playwright/test';

const UI_URL = process.env.SMOKE_UI_URL ?? 'http://localhost:3000';
const ENGINE_URL = process.env.SMOKE_ENGINE_URL ?? 'http://127.0.0.1:8003';
// The engine's well-known e2e password for the accounts seed_setup_complete makes.
const USER = process.env.SMOKE_USER ?? 'initial_user';
const PASSWORD = process.env.SMOKE_PASSWORD ?? 'changeme';

const PAGES = (process.env.SMOKE_PAGES ?? '/sources,/schemas,/rules').split(
  ',',
);

/** The login form's field, whether its label carries the required marker or not. */
const field = (page: Page, label: string) =>
  page
    .getByRole('textbox', { name: label, exact: true })
    .or(page.getByRole('textbox', { name: `* ${label}`, exact: true }))
    .or(page.getByRole('textbox', { name: `${label} *`, exact: true }));

test('login and three pages load against a native engine', async ({ page }) => {
  const seeded = await fetch(new URL('/api/e2e/seed-static', ENGINE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script: 'seed_setup_complete' }),
  });
  expect(seeded.ok, `seed_setup_complete answered ${seeded.status}`).toBe(true);

  const problems: string[] = [];
  let engineCalls = 0;
  page.on('response', (response) => {
    if (!response.url().startsWith(ENGINE_URL)) return;
    engineCalls += 1;
    if (response.status() >= 400) {
      problems.push(
        `${response.status()} ${response.request().method()} ${response.url()}`,
      );
    }
  });
  page.on('requestfailed', (request) => {
    // An aborted request is the page navigating away, not the engine failing.
    if (
      request.url().startsWith(ENGINE_URL) &&
      request.failure()?.errorText !== 'net::ERR_ABORTED'
    ) {
      problems.push(
        `failed ${request.method()} ${request.url()}: ${request.failure()?.errorText}`,
      );
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));

  await page.goto(`${UI_URL}/login`);
  const localTab = page.getByRole('tab', {
    name: 'Login with Local',
    exact: true,
  });
  const username = field(page, 'Username');
  await expect(username.or(localTab).first()).toBeVisible();
  if (await localTab.isVisible()) {
    await localTab.click();
  }
  await username.fill(USER);
  await field(page, 'Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page).not.toHaveURL((url) => url.pathname === '/login', {
    timeout: 120_000,
  });

  for (const path of PAGES) {
    await page.goto(`${UI_URL}${path}`);
    await expect(page).toHaveURL((url) => url.pathname.startsWith(path));
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByText('Cannot reach the DFE engine')).toHaveCount(0);
    await page.waitForLoadState('networkidle');
  }

  expect(engineCalls, 'the browser reached the engine').toBeGreaterThan(0);
  expect(problems, 'failed engine calls or page errors').toEqual([]);
});
