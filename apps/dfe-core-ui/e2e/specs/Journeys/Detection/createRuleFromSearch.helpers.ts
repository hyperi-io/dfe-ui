import { mkdirSync, writeFileSync } from 'node:fs';

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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value != null && typeof value === 'object' && !Array.isArray(value);

/** The sources HyperDX answered with, keeping only the entries that name an id and a table. */
const readSources = (body: unknown): HyperdxSource[] =>
  (Array.isArray(body) ? body : []).flatMap((entry: unknown) =>
    isRecord(entry) &&
    typeof entry.id === 'string' &&
    isRecord(entry.from) &&
    typeof entry.from.tableName === 'string'
      ? [{ id: entry.id, from: { tableName: entry.from.tableName } }]
      : [],
  );

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
        const sources = reply.ok() ? readSources(await reply.json()) : [];
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
  outcome: 'valid' | 'refused' = 'valid',
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
  // The engine is asked before Create can be pressed: it either clears the
  // search or says why not beside the button.
  const button = page.getByTestId('create-rule-from-search-button');
  if (outcome === 'valid') {
    await expect(button).toBeEnabled({ timeout: 30_000 });
    return;
  }
  await expect(page.getByTestId('create-rule-precheck')).toBeVisible({
    timeout: 30_000,
  });
  await expect(button).toBeDisabled();
};

/** Every create-rule request the page sends, with whether it was a dry run. */
export const trackCreateRuleRequests = (page: Page) => {
  const sent: { dryRun: boolean; url: string }[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (!url.pathname.endsWith('/api/dfe/create-rule')) return;
    sent.push({
      dryRun: url.searchParams.get('dry_run') === 'true',
      url: request.url(),
    });
  });
  return sent;
};

/** The rule id a create-rule answer carries. */
export const createdRuleId = (body: unknown): string => {
  if (!isRecord(body) || typeof body.id !== 'string') {
    throw new Error(
      `create-rule answered with no rule id: ${JSON.stringify(body)}`,
    );
  }
  return body.id;
};

/** Screenshot and accessibility snapshot of the page, when JOURNEY_SHOTS_DIR is set. */
export const captureDialog = async (page: Page, name: string) => {
  const dir = process.env.JOURNEY_SHOTS_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png` });
  writeFileSync(
    `${dir}/${name}.aria.yaml`,
    await page.locator('body').ariaSnapshot(),
  );
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
  const body: unknown = await reply.json();
  const editor = status === 201 ? await opened : undefined;
  // A failure after Create is pressed reaches the toast. A saved rule shows none.
  const notification = page.locator('.mantine-Notification-root');
  if (status !== 201) await expect(notification.first()).toBeVisible();
  return {
    status,
    body,
    editor,
    toasts: (await notification.allInnerTexts()).join('\n'),
  };
};
