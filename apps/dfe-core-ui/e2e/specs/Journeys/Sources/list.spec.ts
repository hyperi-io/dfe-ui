import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engine } from '@e2e/config/engineApi.helpers';
import {
  JOURNEY_USER,
  prepareJourneyStack,
  shot,
} from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

prepareJourneyStack();

// 30 throwaway sources so the list has a second page. The UI's "N of M" count
// must follow the API's total_size, and the tree order must follow order_by.
const NAMES = Array.from(
  { length: 30 },
  (_, i) => `jsrc-list-${String(i).padStart(2, '0')}`,
);
type Page = { total_size: number; items: { name: string; enabled: boolean }[] };
const list = (q: string) =>
  engine<Page>('GET', `/api/v1/sources?page_size=1000&${q}`);

test.setTimeout(240_000);
test.use({ actionTimeout: 15_000 });

test.beforeAll(async () => {
  test.setTimeout(600_000);
  await engine('POST', '/api/v1/sources/bulk', {
    action: 'delete',
    sources: NAMES,
  }).catch(() => undefined);
  for (const [i, name] of NAMES.entries()) {
    await engine('POST', '/api/v1/sources', {
      source: name,
      display_name: `JSRC List ${String(29 - i).padStart(2, '0')}`,
      header: { type: 'timeseries', version: '1.0.0' },
      match: { field: '_json.jsrc', operator: 'equals', value: name },
    });
  }
  await engine('PATCH', `/api/v1/sources/${NAMES[3]}`, { enabled: false });
});
test.afterAll(async () => {
  test.setTimeout(300_000);
  await engine('POST', '/api/v1/sources/bulk', {
    action: 'delete',
    sources: NAMES,
  }).catch(() => undefined);
});

test(
  'source list: count, scroll, search, sort',
  { tag: [TAGS.core, TAGS.source] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/sources`);
    const count = page.getByText(/\d+ of \d+ results?/);
    const parse = async () =>
      /(\d+) of (\d+)/
        .exec(await count.innerText())!
        .slice(1)
        .map(Number);
    const rows = page.locator('[data-testid^="source-tree-item-"]');
    const total = (await list('')).total_size;
    await expect.poll(async () => (await parse())[1]).toBe(total);
    await parse();
    await shot(page, '30-list-first-page');

    // scroll to load the rest
    const tree = page.getByRole('tree');
    await expect(async () => {
      await tree.evaluate((node) => {
        let el = node.parentElement;
        while (el) {
          if (['auto', 'scroll'].includes(getComputedStyle(el).overflowY))
            el.scrollTop = el.scrollHeight;
          el = el.parentElement;
        }
      });
      expect((await parse())[0]).toBe(total);
    }).toPass({ timeout: 40_000 });
    await shot(page, '31-list-all-loaded');
    const shown = await rows.evaluateAll((els) =>
      els.map((e) =>
        e.getAttribute('data-testid')!.replace('source-tree-item-', ''),
      ),
    );
    const apiNames = (await list('')).items.map((i) => i.name);
    // `main` is the core source and has no tree-item test id.
    expect(shown.filter((n) => n !== 'main').length).toBe(
      apiNames.filter((n) => n !== 'main').length,
    );

    // keyword search matches the API
    await page.goto(`${BASE_URL}/sources?search=jsrc-list-2`);
    const want = await list('search=jsrc-list-2');
    await expect.poll(async () => (await parse())[1]).toBe(want.total_size);
    expect(want.total_size).toBe(10);

    // status filter
    await page.goto(`${BASE_URL}/sources?status=disabled`);
    const off = await list('enabled=false');
    await expect.poll(async () => (await parse())[1]).toBe(off.total_size);

    // sort through the filter panel: Display Name, then descending
    await page.goto(`${BASE_URL}/sources?search=jsrc-list-`);
    await page.getByRole('button', { name: /^Filters/ }).click();
    await page.getByRole('button', { name: /Sort by/ }).click();
    await page
      .locator('.ant-select')
      .filter({ hasText: /Sort by/ })
      .first()
      .click();
    await page
      .locator('.ant-select-dropdown:visible')
      .getByText('Display Name', { exact: true })
      .click();
    await expect(page).toHaveURL(/sort_by=display_name/);
    const order = async () =>
      rows.evaluateAll((els) =>
        els.map((e) =>
          e.getAttribute('data-testid')!.replace('source-tree-item-', ''),
        ),
      );
    const asc = (
      await list('search=jsrc-list-&order_by=display_name')
    ).items.map((s) => s.name);
    await expect.poll(order).toEqual(asc);
    await shot(page, '32-list-sorted-asc');
    // The direction button is icon-only with no accessible name.
    await page.locator('button.w-10').first().click();
    await expect(page).toHaveURL(/sort_order=desc/);
    const desc = (
      await list('search=jsrc-list-&order_by=display_name desc')
    ).items.map((s) => s.name);
    await expect.poll(order).toEqual(desc);
    await shot(page, '33-list-sorted-desc');
  },
);
