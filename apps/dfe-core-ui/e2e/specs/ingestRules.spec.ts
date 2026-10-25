import { APIRequestContext, Page, expect, test } from '@playwright/test';

import { BASE_URL } from '../config/e2e.client';
import {
  CHANGE_PASSWORD_PATH,
  adminPassword,
  completeForcedPasswordChange,
  newAdminPassword,
  textbox,
} from '../config/login.helpers';

/**
 * Compound and expression source matches, the receiver's rule order and the
 * usage strip, against a deployed stack with no e2e helpers mounted.
 *
 * It signs in as the deployment's own admin, so it runs on a fresh stack and
 * again on one it has already set up, and every source it makes it deletes.
 */

const COMPOUND = 'rulescompound';
const EXPRESSION = 'rulescel';
const EXTRA = 'rulesextra';
const MADE = [COMPOUND, EXPRESSION, EXTRA];

test.describe.configure({ mode: 'serial' });

let token: string | undefined;
/** Whichever of the two passwords the admin holds once signed in. */
let heldPassword: string | undefined;

/** The engine, as the admin, through the same origin the console calls it on. */
const engine = async (
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  data?: unknown,
) => {
  if (!token) {
    const login = await request.post(`${BASE_URL}/api/v1/auth/login`, {
      data: { username: 'admin', password: heldPassword ?? adminPassword() },
    });
    expect(login.ok(), 'the admin signs in to the engine').toBeTruthy();
    token = (await login.json()).access_token as string;
  }
  return request.fetch(`${BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
};

/** Through whichever first-run wizard steps the deployment has left, the way an operator would. */
const completeSetup = async (page: Page) => {
  const steps: Record<string, () => Promise<void>> = {
    '/setup/welcome': () =>
      page.getByRole('button', { name: 'Next', exact: true }).click(),
    '/setup/configureOrganisation': async () => {
      await textbox(page, 'Name').fill('rules_e2e');
      await textbox(page, 'Display Name').fill('Rules e2e');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
    },
    '/setup/configureLogin': () =>
      page.getByRole('button', { name: 'Skip for now', exact: true }).click(),
    '/setup/configureUser': async () => {
      await textbox(page, 'Username').fill('rules_e2e_user');
      await textbox(page, 'Email').fill('rules_e2e_user@example.com');
      await textbox(page, 'Password').fill(newAdminPassword());
      await page
        .getByRole('button', { name: 'Create Account', exact: true })
        .click();
    },
    '/setup/complete': () =>
      page.getByRole('button', { name: 'Get started', exact: true }).click(),
  };
  for (;;) {
    const path = new URL(page.url()).pathname;
    if (path === '/setup') {
      await page.waitForURL((url) => url.pathname !== '/setup');
      continue;
    }
    const step = steps[path];
    if (!step) return;
    await step();
    await page.waitForURL((url) => url.pathname !== path);
  }
};

/** The issued password on a fresh stack, the changed one on a stack this has already run on. */
const signIn = async (page: Page) => {
  await page.goto(`${BASE_URL}/login`);
  for (const password of [adminPassword(), newAdminPassword()]) {
    await textbox(page, 'Username').fill('admin');
    await textbox(page, 'Password').fill(password);
    await page.getByRole('button', { name: 'Login', exact: true }).click();
    const left = await page
      .waitForURL((url) => url.pathname !== '/login', { timeout: 15_000 })
      .then(
        () => true,
        () => false,
      );
    if (left) {
      heldPassword = password;
      break;
    }
  }
  if (new URL(page.url()).pathname === CHANGE_PASSWORD_PATH) {
    await completeForcedPasswordChange(page, 'admin');
    heldPassword = newAdminPassword();
  }
  if (new URL(page.url()).pathname.startsWith('/setup')) {
    await completeSetup(page);
  }
  await expect(page).toHaveURL((url) => url.pathname === '/sources');
};

const openAddSource = async (page: Page, name: string) => {
  await page.goto(`${BASE_URL}/sources`);
  await page.getByRole('button', { name: 'Add Source' }).first().click();
  const drawer = page.getByRole('dialog', { name: 'Add Source' });
  await drawer.getByLabel(/^Source Name/).fill(name);
  // The shared table needs no table settings, so the match is all the form asks for.
  await drawer.getByText('Shared table', { exact: true }).click();
  return drawer;
};

/** An antd select, by its accessible name, set to the option with this text. */
const choose = async (page: Page, label: string, option: string) => {
  await page.getByRole('combobox', { name: label }).click();
  await page
    .locator('.ant-select-dropdown:visible')
    .getByTitle(option, { exact: true })
    .click();
};

const sourceMatch = async (request: APIRequestContext, name: string) => {
  const response = await engine(request, 'GET', `/api/v1/sources/${name}`);
  expect(response.ok(), `the engine has ${name}`).toBeTruthy();
  const body = await response.json();
  return {
    match: body.version?.match ?? body.match ?? null,
    when: body.version?.when ?? body.when ?? null,
  };
};

const forgetSources = async (request: APIRequestContext) => {
  for (const name of MADE) {
    await engine(request, 'DELETE', `/api/v1/sources/${name}`);
  }
};

test.beforeAll(async ({ browser, request }) => {
  const page = await browser.newPage();
  await signIn(page);
  await page.close();
  await forgetSources(request);
});

test.afterAll(async ({ request }) => {
  await forgetSources(request);
});

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test('a source matched on grouped and negated conditions saves the tree it shows', async ({
  page,
  request,
}) => {
  const drawer = await openAddSource(page, COMPOUND);
  await drawer.getByLabel(/^Field/).fill('data_stream.dataset');
  await drawer.getByLabel(/^Value/).fill('cisco_ios.log');

  await drawer.getByRole('button', { name: 'Add condition' }).click();
  await drawer.getByLabel('Condition 2 field').fill('agent.type');
  await drawer.getByLabel('Condition 2 value').fill('winlogbeat');
  await drawer.getByLabel('Condition 2: not').check();

  await drawer.getByRole('button', { name: 'Add group' }).first().click();
  await choose(page, 'Group 3: how the conditions combine', 'any');
  await drawer.getByLabel('Condition 3.1 field').fill('host.name');
  await choose(page, 'Condition 3.1 operator', 'starts_with');
  await drawer.getByLabel('Condition 3.1 value').fill('fw-');
  await drawer.getByLabel('Condition 3.2 field').fill('observer.vendor');
  await choose(page, 'Condition 3.2 operator', 'exists');

  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(page.getByText('Source created successfully')).toBeVisible({
    timeout: 30_000,
  });

  const { match, when } = await sourceMatch(request, COMPOUND);
  expect(when).toBeNull();
  expect(match).toMatchObject({
    all: [
      {
        field: 'data_stream.dataset',
        operator: 'equals',
        value: 'cisco_ios.log',
      },
      {
        field: 'agent.type',
        operator: 'equals',
        value: 'winlogbeat',
        negate: true,
      },
      {
        any: [
          { field: 'host.name', operator: 'starts_with', value: 'fw-' },
          { field: 'observer.vendor', operator: 'exists' },
        ],
      },
    ],
  });
  expect(match.negate ?? false).toBe(false);
});

test('a refused expression is marked where the engine stopped, and saves once fixed', async ({
  page,
  request,
}) => {
  const drawer = await openAddSource(page, EXPRESSION);
  await drawer.getByText('CEL Fast expression', { exact: true }).click();
  const expression = drawer.getByLabel(/^Expression/);
  await expression.fill("data_stream.dataset == 'okta.system' &&");

  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(expression).toHaveAttribute('aria-invalid', 'true', {
    timeout: 30_000,
  });
  await expect(drawer.getByTestId('when-error-span')).toBeVisible();
  await expect(drawer.getByLabel(/^Field/)).toHaveCount(0);

  await expression.fill("data_stream.dataset == 'okta.system'");
  await drawer.getByRole('button', { name: 'Add Source', exact: true }).click();
  await expect(page.getByText('Source created successfully')).toBeVisible({
    timeout: 30_000,
  });

  const { match, when } = await sourceMatch(request, EXPRESSION);
  expect(match).toBeNull();
  expect(when).toBe("data_stream.dataset == 'okta.system'");
});

test('the rule order saves a move, and refuses one made against a list that changed', async ({
  page,
  request,
}) => {
  await page.goto(`${BASE_URL}/sources/ingest-rules`);
  const sourceRules = page.getByRole('list', { name: 'Source rules order' });
  await expect(
    sourceRules.getByTestId(`rule-block-source.${COMPOUND}`),
  ).toBeVisible({
    timeout: 30_000,
  });

  const order = () =>
    sourceRules
      .getByRole('listitem')
      .evaluateAll((items) =>
        items.map((item) => item.getAttribute('data-testid')),
      );

  // A keyboard move, saved.
  const before = await order();
  const first = before[0]?.replace('rule-block-', '') ?? '';
  const handle = sourceRules.getByRole('button', {
    name: /^Reorder .*, position 1 of /,
  });
  await handle.focus();
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('status').filter({ hasText: 'position 2 of' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Save order' }).first().click();
  await expect(page.getByText('Order saved')).toBeVisible({ timeout: 30_000 });
  // The toast shows before the list refetches, so wait for the stored order.
  await expect.poll(async () => (await order())[1]).toBe(`rule-block-${first}`);

  // Another writer adds a source after the page read the list.
  await sourceRules
    .getByRole('button', { name: /^Reorder .*, position 2 of / })
    .focus();
  await page.keyboard.press('ArrowUp');
  const created = await engine(request, 'POST', '/api/v1/sources', {
    source: EXTRA,
    enabled: true,
    archive: false,
    match: {
      field: 'data_stream.dataset',
      operator: 'equals',
      value: 'rules.extra',
    },
    fetcher: null,
  });
  expect(created.ok(), await created.text()).toBeTruthy();

  await page.getByRole('button', { name: 'Save order' }).first().click();
  await expect(
    page.getByText('The blocks changed since this page loaded'),
  ).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(`Added since: ${EXTRA}`)).toBeVisible();

  await page.getByRole('button', { name: 'Reload' }).click();
  await expect(
    sourceRules.getByTestId(`rule-block-source.${EXTRA}`),
  ).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    page.getByText('The blocks changed since this page loaded'),
  ).toHaveCount(0);
});

test('the dashboards page opens on the usage strip above the dashboard', async ({
  page,
}) => {
  await page.goto(`${BASE_URL}/observe/dashboards`);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible({
    timeout: 30_000,
  });
  const tiles = page.getByRole('list', { name: 'Usage' }).getByRole('listitem');
  await expect(tiles).toHaveCount(4);
  await expect(
    page.getByRole('link', { name: 'Open Overview' }),
  ).toHaveAttribute('href', '/observe/dashboards/default');
});
