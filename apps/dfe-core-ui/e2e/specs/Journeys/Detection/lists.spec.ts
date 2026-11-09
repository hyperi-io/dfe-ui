import { Page, expect as baseExpect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, shot } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import {
  apiCreateRule,
  dropSource,
  engineClient,
  ensureSource,
} from './detection.helpers';

/**
 * The rules list as a user works it: search, filter, sort, scroll to load more,
 * and the URL query keeps the view across a reload. "N of M results" is the rows
 * loaded so far over the engine's total_size, so M is checked against the API.
 */
const expect = baseExpect.configure({ timeout: 20_000 });

const PREFIX = 'jdet-lst';
const COUNT = 60;
const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
const nameOf = (i: number) => `${PREFIX}-${String(i).padStart(2, '0')}`;
const displayOf = (i: number) => `JDET List ${String(i).padStart(2, '0')}`;

test.setTimeout(420_000);
test.use({ actionTimeout: 15_000 });

type Api = ReturnType<typeof engineClient>;
let api: Api;
let madeSource = false;

test.beforeAll(async ({ playwright }) => {
  test.setTimeout(420_000);
  const request = await playwright.request.newContext();
  api = engineClient(request, await engineToken());
  madeSource = await ensureSource(api);
  const have = await (
    await api.get(`/rules?search=${PREFIX}&page_size=1`)
  ).json();
  if (have.total_size === COUNT) return;
  for (let i = 0; i < COUNT; i += 1) {
    await api.del(`/rules/${nameOf(i)}`);
    await apiCreateRule(api, nameOf(i), {
      display_name: displayOf(i),
      severity: SEVERITIES[i % 4],
      // Even rules carry a source label, so the Source filter has half of them.
      ...(i % 2 === 0 ? { source: 'jdet-src' } : {}),
    });
  }
});

test.afterAll(async () => {
  for (let i = 0; i < COUNT; i += 1) await api.del(`/rules/${nameOf(i)}`);
  if (madeSource) await dropSource(api);
});

const total = async (query: string) =>
  (await (await api.get(`/rules?${query}`)).json()).total_size as number;

const rowNames = (page: Page) =>
  page.getByRole('button', { name: /^JDET List \d\d/ }).allInnerTexts();

const openFilters = async (page: Page) => {
  const keyword = page.getByRole('textbox', { name: /Keyword/ });
  if (!(await keyword.isVisible())) {
    await page.getByRole('button', { name: /^Filters/ }).click();
  }
  await expect(keyword).toBeVisible();
};

const apply = (page: Page) =>
  page.getByRole('button', { name: 'Apply Filters', exact: true }).click();

test(
  'Rules list: count, search, filters, scroll',
  { tag: [TAGS.core] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/rules`);
    await shot(page, 'lists-rules-default');

    // M comes from the engine: the unfiltered total
    const all = await total('');
    await expect(
      page.getByText(new RegExp(`^25 of ${all} results$`)),
    ).toBeVisible();

    // SEARCH narrows to the seeded rules, and the count is the API's total_size
    await openFilters(page);
    await page.getByRole('textbox', { name: /Keyword/ }).fill(PREFIX);
    await apply(page);
    await expect(page).toHaveURL(
      (u) => u.searchParams.get('search') === PREFIX,
    );
    expect(await total(`search=${PREFIX}`)).toBe(COUNT);
    await expect(page.getByText(`25 of ${COUNT} results`)).toBeVisible();
    await shot(page, 'lists-rules-search');

    // SCROLL loads the next page: 25 -> 50 -> 60
    const scroll = async () => {
      const list = page
        .getByRole('list')
        .filter({ has: page.getByText(displayOf(0), { exact: true }) });
      await list.evaluate((n) => {
        const s = n.parentElement;
        if (s) s.scrollTop = s.scrollHeight;
      });
    };
    for (const n of [50, COUNT]) {
      await expect(async () => {
        await scroll();
        await expect(page.getByText(`${n} of ${COUNT} results`)).toBeVisible({
          timeout: 3_000,
        });
      }).toPass({ timeout: 30_000 });
    }
    expect((await rowNames(page)).length).toBe(COUNT);

    // SEVERITY filter: a quarter of the seeded rules, same as the API says
    await openFilters(page);
    await page.locator('#severity').click({ force: true });
    await page.locator('.ant-select-item-option', { hasText: 'High' }).click();
    await apply(page);
    await expect(page).toHaveURL(
      (u) => u.searchParams.get('severity') === 'high',
    );
    const high = await total(`search=${PREFIX}&severity=high`);
    expect(high).toBe(COUNT / 4);
    await expect(page.getByText(`${high} of ${high} results`)).toBeVisible();
    expect((await rowNames(page)).length).toBe(high);
    await shot(page, 'lists-rules-severity');

    // SOURCE filter on top: the even rules, high ones among them
    await openFilters(page);
    await page.locator('#source').click({ force: true });
    await page
      .locator('.ant-select-item-option', { hasText: 'jdet-src' })
      .first()
      .click();
    await apply(page);
    await expect(page).toHaveURL(
      (u) => u.searchParams.get('source') === 'jdet-src',
    );
    const both = await total(`search=${PREFIX}&severity=high&source=jdet-src`);
    await expect(page.getByText(`${both} of ${both} results`)).toBeVisible();
    expect(both).toBe(COUNT / 4);
    await shot(page, 'lists-rules-severity-source');

    // CLEAR puts the full list back
    await openFilters(page);
    await page
      .getByRole('button', { name: 'Clear Filters', exact: true })
      .click();
    await expect(page).toHaveURL(
      (u) => !u.searchParams.has('severity') && !u.searchParams.has('source'),
    );
    await expect(page.getByText(/^25 of \d+ results$/)).toBeVisible();
  },
);

const apiOrder = async (orderBy: string, size = 25) => {
  const body = await (
    await api.get(
      `/rules?search=${PREFIX}&page_size=${size}&order_by=${encodeURIComponent(orderBy)}`,
    )
  ).json();
  return (body.items as { display_name: string }[]).map((r) => r.display_name);
};

test(
  'Rules list: sort and URL params survive a reload',
  { tag: [TAGS.core] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/rules?search=${PREFIX}`);
    await expect(page.getByText(`25 of ${COUNT} results`)).toBeVisible();

    // SORT through the console: Name, descending
    await openFilters(page);
    await page.getByRole('button', { name: /^Sort by/ }).click();
    await page
      .locator(
        '#' +
          (await page
            .locator('label', { hasText: 'Sort by' })
            .getAttribute('for')),
      )
      .click({ force: true });
    await page
      .locator('.ant-select-item-option', { hasText: /^Name$/ })
      .click();
    await shot(page, 'lists-rules-sort-open');
    await expect(page).toHaveURL(
      (u) => u.searchParams.get('sort_by') === 'name',
    );
    await page
      .getByRole('button')
      .filter({ has: page.locator('svg[class*="sort"]') })
      .click();
    await expect(page).toHaveURL(
      (u) => u.searchParams.get('sort_by') === 'name',
    );
    await expect(page).toHaveURL((u) => u.searchParams.has('sort_order'));
    const sortOrder = new URL(page.url()).searchParams.get('sort_order');
    const want = await apiOrder(sortOrder === 'desc' ? 'name desc' : 'name');
    await expect
      .poll(async () =>
        (await rowNames(page)).map((n) => n.split('\n')[0]).slice(0, 25),
      )
      .toEqual(want);
    await shot(page, 'lists-rules-sorted');
  },
);

test(
  'Rules list: query params round-trip on load and reload',
  { tag: [TAGS.core] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    const url = `${BASE_URL}/rules?search=${PREFIX}&severity=critical&sort_by=name&sort_order=desc&page_size=5`;
    await page.goto(url);
    await page.waitForTimeout(4000);
    await shot(page, 'lists-rules-params');
    const critical = await total(`search=${PREFIX}&severity=critical`);
    await expect(
      page.getByText(new RegExp(`^\\d+ of ${critical} results$`)),
    ).toBeVisible();
    const first = (await rowNames(page))
      .map((n) => n.split('\n')[0])
      .slice(0, 5);
    const api5 = await (
      await api.get(
        `/rules?search=${PREFIX}&severity=critical&order_by=name%20desc&page_size=5`,
      )
    ).json();
    expect(first).toEqual(
      api5.items
        .slice(0, 5)
        .map((r: { display_name: string }) => r.display_name),
    );

    await page.reload();
    await expect(page).toHaveURL((u) =>
      ['search', 'severity', 'sort_by', 'sort_order', 'page_size'].every((k) =>
        u.searchParams.has(k),
      ),
    );
    await expect(
      page.getByText(new RegExp(`^\\d+ of ${critical} results$`)),
    ).toBeVisible();
    await openFilters(page);
    await expect(page.getByRole('textbox', { name: /Keyword/ })).toHaveValue(
      PREFIX,
    );
    await shot(page, 'lists-rules-reloaded');
  },
);
