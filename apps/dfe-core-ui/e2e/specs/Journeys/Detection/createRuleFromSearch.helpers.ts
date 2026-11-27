import { BrowserContext, Page, expect } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';

export type SearchSpec = {
  where: string;
  language: 'sql' | 'lucene';
  select?: string;
  orderBy?: string;
};

/** HyperDX's own origin, read from the console's embedded Search frame. */
export const hyperdxOrigin = async (page: Page): Promise<string> => {
  await page.goto(`${BASE_URL}/observe/search`);
  const frame = page.locator('iframe[src*="embed=1"]').first();
  await expect(frame).toBeAttached({ timeout: 30_000 });
  return new URL((await frame.getAttribute('src')) ?? '').origin;
};

type HyperdxSource = { id: string; from: { tableName: string } };

/** The id HyperDX holds a source under, found by the table it reads. */
export const hyperdxSourceId = async (
  page: Page,
  origin: string,
  table: string,
): Promise<string> => {
  let id = '';
  await expect
    .poll(
      async () => {
        const reply = await page.request.get(`${origin}/api/sources`);
        const sources: HyperdxSource[] = reply.ok() ? await reply.json() : [];
        id = sources.find((s) => s.from.tableName === table)?.id ?? '';
        return id;
      },
      { timeout: 120_000, intervals: [3_000] },
    )
    .not.toBe('');
  return id;
};

/** Open HyperDX's Search view on the state a user would have typed. */
export const openSearch = async (
  page: Page,
  origin: string,
  sourceId: string,
  search: SearchSpec,
) => {
  const to = Date.now() + 60_000;
  const query = new URLSearchParams({
    embed: '1',
    theme: 'light',
    source: sourceId,
    where: search.where,
    whereLanguage: search.language,
    select: search.select ?? '_timestamp,_json',
    orderBy: search.orderBy ?? '_timestamp DESC',
    filters: '[]',
    from: String(to - 3_600_000),
    to: String(to),
  });
  await page.goto(`${origin}/search?${query}`);
  await expect(page.getByTestId('create-rule-from-search-button')).toBeEnabled({
    timeout: 30_000,
  });
};

/** Click Create Rule, and report what the engine answered and what the user saw. */
export const clickCreateRule = async (page: Page, context: BrowserContext) => {
  const answered = page.waitForResponse((r) =>
    r.url().includes('/api/dfe/create-rule'),
  );
  const opened = context
    .waitForEvent('page', { timeout: 20_000 })
    .catch(() => undefined);
  await page.getByTestId('create-rule-from-search-button').click();
  const reply = await answered;
  const status = reply.status();
  const body = await reply.json();
  const editor = status === 201 ? await opened : undefined;
  await page.waitForTimeout(500);
  const toasts = await page
    .locator('.mantine-Notification-root')
    .allInnerTexts();
  return { status, body, editor, toasts: toasts.join('\n') };
};
