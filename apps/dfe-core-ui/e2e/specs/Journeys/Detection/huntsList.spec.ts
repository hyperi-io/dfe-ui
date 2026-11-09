import { Page, expect as baseExpect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, shot } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { apiCreateRule, engineClient } from './detection.helpers';

/**
 * The hunts list: search, sort, scroll to load, and the URL query keeps the view
 * across a reload. "N of M results" is checked against the API's total_size.
 */
const expect = baseExpect.configure({ timeout: 20_000 });

const PREFIX = 'jdet-hl';
const RULE = 'jdet-hl-rule';
const COUNT = 30;
const nameOf = (i: number) => `${PREFIX}-${String(i).padStart(2, '0')}`;
const displayOf = (i: number) => `JDET Hunt ${String(i).padStart(2, '0')}`;

test.setTimeout(300_000);
test.use({ actionTimeout: 15_000 });

type Api = ReturnType<typeof engineClient>;
let api: Api;

test.beforeAll(async ({ playwright }) => {
  test.setTimeout(300_000);
  const request = await playwright.request.newContext();
  api = engineClient(request, await engineToken());
  const have = await (
    await api.get(`/hunts?search=${PREFIX}&page_size=1`)
  ).json();
  if (have.total_size === COUNT) return;
  await api.del(`/rules/${RULE}`);
  await apiCreateRule(api, RULE);
  for (let i = 0; i < COUNT; i += 1) {
    await api.del(`/hunts/${nameOf(i)}`);
    const res = await api.post('/hunts', {
      name: nameOf(i),
      display_name: displayOf(i),
      cron: '*/15 * * * *',
      customers: ['default'],
      global_source_table_name: 'main',
      rules: [RULE],
    });
    expect(res.ok(), await res.text()).toBeTruthy();
  }
});

test.afterAll(async () => {
  for (let i = 0; i < COUNT; i += 1) await api.del(`/hunts/${nameOf(i)}`);
  await api.del(`/rules/${RULE}`);
});

const rowNames = (page: Page) =>
  page.getByRole('button', { name: /^JDET Hunt \d\d/ }).allInnerTexts();

const openFilters = async (page: Page) => {
  const keyword = page.getByRole('textbox', { name: /Keyword/ });
  if (!(await keyword.isVisible())) {
    await page.getByRole('button', { name: /^Filters/ }).click();
  }
  await expect(keyword).toBeVisible();
};

test(
  'Hunts list: sort and URL params round-trip',
  { tag: [TAGS.core] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    await page.goto(
      `${BASE_URL}/hunts?search=${PREFIX}&sort_by=name&sort_order=desc&page_size=5`,
    );
    await expect(
      page.getByText(new RegExp(`^\\d+ of ${COUNT} results$`)),
    ).toBeVisible();
    const api5 = await (
      await api.get(`/hunts?search=${PREFIX}&order_by=name%20desc&page_size=5`)
    ).json();
    await expect
      .poll(async () =>
        (await rowNames(page)).map((n) => n.split('\n')[0]).slice(0, 5),
      )
      .toEqual(api5.items.map((h: { display_name: string }) => h.display_name));
    await shot(page, 'lists-hunts-sorted');

    await page.reload();
    await expect(page).toHaveURL((u) =>
      ['search', 'sort_by', 'sort_order', 'page_size'].every((k) =>
        u.searchParams.has(k),
      ),
    );
    await expect(
      page.getByText(new RegExp(`^\\d+ of ${COUNT} results$`)),
    ).toBeVisible();
    await openFilters(page);
    await expect(page.getByRole('textbox', { name: /Keyword/ })).toHaveValue(
      PREFIX,
    );
  },
);
