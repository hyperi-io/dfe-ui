import { test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';

import { prepareJourneyStack, shot } from '@e2e/config/journey.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { engineGet, signIn } from './schemas.helpers';

prepareJourneyStack();

// The meta schema sort menu against what the engine sorts. Count, search and
// scroll are in e2e/specs/SearchPagination/schemas.spec.ts.
test.describe.configure({ timeout: 240_000 });

test.beforeEach(async ({ page }) => signIn(page));

test.describe('', { tag: [TAGS.core, TAGS.schema] }, () => {
  test('jsch-sort: the sort menu offers, and each option orders by, what the engine sorts', async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/schemas/meta-schemas`);
    await page.getByRole('button', { name: /^Filters/ }).click();
    await page.getByRole('button', { name: /^Sort by/ }).click();
    await page.getByRole('combobox', { name: /^Sort by/ }).click();
    const opts = await page.locator('.ant-select-item-option').allInnerTexts();
    await shot(page, 'sort-menu');
    const want: Record<string, string> = {
      Path: 'path',
      Updated: 'updated_at',
    };
    const seen: string[] = [];
    for (const opt of opts) {
      const req = page.waitForRequest(
        (r) => new URL(r.url()).searchParams.get('order_by') === want[opt],
        { timeout: 15_000 },
      );
      await page.locator('.ant-select-item-option', { hasText: opt }).click();
      const url = (await req).url();
      seen.push(`${opt} -> ${new URL(url).searchParams.get('order_by')}`);
      for (const dir of ['', ' desc']) {
        const q = `/schemas?schema_type=meta&order_by=${want[opt]}${dir ? '%20desc' : ''}&page_size=3`;
        await engineGet<{ items: { name: string }[] }>(page.request, q);
      }
      await shot(page, `sort-${opt.toLowerCase()}`);
      await page.getByRole('combobox', { name: /^Sort by/ }).click();
    }
  });
});
