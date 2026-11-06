import { APIRequestContext, Page, expect, test } from '@playwright/test';

import { BASE_URL, ENGINE_API_URL, e2eClient } from '@e2e/config/e2e.client';
import { adminPassword, loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

/**
 * Compound and expression source matches, the receiver's rule order and the
 * usage strip.
 *
 * seed_setup_complete puts admin on its own password, so this signs in as
 * initial_user, who keeps the suite password. Every source it makes it deletes.
 */

const COMPOUND = 'rulescompound';
const EXPRESSION = 'rulescel';
const EXTRA = 'rulesextra';
const MADE = [COMPOUND, EXPRESSION, EXTRA];

// Login compiles the landing page, and the save expects their own 30s, so the
// 30s default ends the test while the first of those is still waiting.
test.describe.configure({ mode: 'serial', timeout: 90_000 });

let token: string | undefined;

/** The engine, as initial_user. The console does not proxy the engine. */
const engine = async (
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  data?: unknown,
) => {
  if (!token) {
    const login = await request.post(`${ENGINE_API_URL}/api/v1/auth/login`, {
      data: { username: 'initial_user', password: adminPassword() },
    });
    expect(login.ok(), 'initial_user signs in to the engine').toBeTruthy();
    token = (await login.json()).access_token as string;
  }
  return request.fetch(`${ENGINE_API_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
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

test.beforeAll(async ({ playwright, request }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  token = undefined;
  await forgetSources(request);
});

test.afterAll(async ({ request }) => {
  await forgetSources(request);
});

test.beforeEach(async ({ page }) => {
  await loginAs(page, 'initial_user');
});

test.describe('', { tag: [TAGS.core, TAGS.source] }, () => {
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

    await drawer
      .getByRole('button', { name: 'Add Source', exact: true })
      .click();
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

    await drawer
      .getByRole('button', { name: 'Add Source', exact: true })
      .click();
    await expect(expression).toHaveAttribute('aria-invalid', 'true', {
      timeout: 30_000,
    });
    await expect(drawer.getByTestId('when-error-span')).toBeVisible();
    await expect(drawer.getByLabel(/^Field/)).toHaveCount(0);

    await expression.fill("data_stream.dataset == 'okta.system'");
    await drawer
      .getByRole('button', { name: 'Add Source', exact: true })
      .click();
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
    await expect(page.getByText('Order saved')).toBeVisible({
      timeout: 30_000,
    });
    // The toast shows before the list refetches, so wait for the stored order.
    await expect
      .poll(async () => (await order())[1])
      .toBe(`rule-block-${first}`);

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
    const tiles = page
      .getByRole('list', { name: 'Usage' })
      .getByRole('listitem');
    await expect(tiles).toHaveCount(4);
    await expect(
      page.getByRole('link', { name: 'Open Overview' }),
    ).toHaveAttribute('href', '/observe/dashboards/default');
  });
});
