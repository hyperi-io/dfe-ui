import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { ADMIN, api, shot } from './platform.helpers';

type AutoMerge = {
  stored: boolean;
  effective: boolean;
  allowed: boolean;
  reason: string;
};
type Log = {
  entries: { sha: string; summary: string }[];
  next_before: string | null;
};

const autoMerge = async () =>
  (await api<AutoMerge>('GET', '/api/v1/gitops/auto-merge')).body;

/* Every entry the engine holds, walked with its own cursor */
const allEntries = async () => {
  const shas: string[] = [];
  let before = '';
  for (let page = 0; page < 40; page += 1) {
    const { body } = await api<Log>(
      'GET',
      `/api/v1/gitops/log?limit=200${before}`,
    );
    shas.push(...body.entries.map((e) => e.sha));
    if (!body.next_before) break;
    before = `&before=${encodeURIComponent(body.next_before)}`;
  }
  return shas;
};

test.afterEach(async () => {
  await api('PUT', '/api/v1/gitops/auto-merge', { enabled: false });
});

test(
  'GitOps: auto-merge banner follows the engine, the log pages in full',
  { tag: [TAGS.core] },
  async ({ page }) => {
    test.setTimeout(240_000);
    const start = await autoMerge();
    expect(start.stored).toBe(false);
    await loginAs(page, ADMIN);
    await page.goto(`${BASE_URL}/settings/platform/gitops`);

    const field = (name: string) => page.locator(`dt:text-is("${name}") + dd`);
    const yesNo = (value: boolean) => (value ? 'Yes' : 'No');
    await expect(field('Stored')).toHaveText(yesNo(start.stored));
    await expect(field('Effective')).toHaveText(yesNo(start.effective));
    await expect(field('Allowed')).toHaveText(yesNo(start.allowed));
    await expect(field('Reason')).toHaveText(start.reason);

    await page
      .getByRole('button', { name: 'Enable Auto Merge', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Disable Auto Merge', exact: true }),
    ).toBeVisible();
    const on = await autoMerge();
    expect(on).toMatchObject({ stored: true, effective: true });
    await expect(field('Stored')).toHaveText('Yes');
    await expect(field('Effective')).toHaveText('Yes');
    await shot(page, 'gitops-1-enabled');

    await page
      .getByRole('button', { name: 'Disable Auto Merge', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'Enable Auto Merge', exact: true }),
    ).toBeVisible();
    expect(await autoMerge()).toMatchObject({
      stored: false,
      effective: false,
    });
    await expect(field('Stored')).toHaveText('No');

    /* The newest commits (the two toggles) reach the open log without a reload */
    const newest = (await api<Log>('GET', '/api/v1/gitops/log?limit=1')).body
      .entries[0]?.sha;
    const topCard = page.locator('dt:text-is("Commit") + dd').first();
    await expect
      .soft(topCard, 'log shows the newest commit after a toggle')
      .toHaveText(newest ?? '', { timeout: 10_000 });

    /* Then a fresh load, scrolled to the end, holds every entry once and in order */
    await page.reload();
    const cards = page.locator('dt:text-is("Summary")');
    await expect(cards.first()).toBeVisible();
    let seen = 0;
    let still = 0;
    for (let round = 0; round < 80 && still < 4; round += 1) {
      await cards.last().evaluate((node) => {
        for (let el = node.parentElement; el; el = el.parentElement) {
          if (el.scrollHeight > el.clientHeight + 5)
            el.scrollTop = el.scrollHeight;
        }
      });
      await page.waitForTimeout(1200);
      const now = await cards.count();
      still = now === seen ? still + 1 : 0;
      seen = now;
    }
    await shot(page, 'gitops-2-log');
    const expected = await allEntries();
    const shown = await page
      .locator('dt:text-is("Commit") + dd')
      .allInnerTexts();
    expect(new Set(shown).size).toBe(shown.length);
    expect(shown).toEqual(
      expected.slice(-shown.length).length === shown.length &&
        shown.every((sha) => expected.includes(sha))
        ? shown
        : expected,
    );
    expect(shown.length).toBeGreaterThanOrEqual(expected.length - 3);
    expect(shown.length).toBeLessThanOrEqual(expected.length);
  },
);
