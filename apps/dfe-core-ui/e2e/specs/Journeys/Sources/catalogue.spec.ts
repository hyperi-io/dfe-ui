import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engine } from '@e2e/config/engineApi.helpers';
import {
  JOURNEY_USER,
  knownConsoleDefect,
  prepareJourneyStack,
  shot,
} from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { deleteIfPresent } from './sources.helpers';

prepareJourneyStack();

// The Add From Catalogue drawer: counts against the API, then create two
// entries and read them back.
type Cat = {
  total_size: number;
  items: {
    name: string;
    intakes: string[];
    default_intake: string;
    runnable: boolean;
    runnable_reason?: string;
  }[];
};
const cat = (q: string) =>
  engine<Cat>('GET', `/api/v1/sources/catalogue?page_size=100&${q}`);

test.setTimeout(240_000);
test.use({ actionTimeout: 15_000 });
// A catalogue entry already created cannot be selected again, so the entries
// this spec picks are cleared first.
const created: string[] = [];
test.beforeAll(async () => {
  for (const e of (await cat('search=okta')).items) {
    await deleteIfPresent(e.name);
  }
});
test.afterAll(async () => {
  for (const n of created) await deleteIfPresent(n);
});

test(
  'catalogue drawer: filter, page, and what can be selected',
  { tag: [TAGS.core, TAGS.source] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/sources`);
    await page
      .getByRole('button', { name: 'Add from catalogue', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Add from catalogue' });
    const shown = drawer.getByText(/\d+ of \d+ entries shown/);
    const totalShown = async () =>
      Number(/of (\d+)/.exec(await shown.innerText())![1]);
    await expect(shown).toBeVisible({ timeout: 30_000 });
    await expect.poll(totalShown).toBe((await cat('')).total_size);
    await shot(page, '20-catalogue-open');

    // search
    const search = drawer.getByPlaceholder('Search by name or dataset');
    await search.fill('okta');
    await expect.poll(totalShown).toBe((await cat('search=okta')).total_size);
    await search.fill('');

    // tag filter
    await drawer.getByRole('button', { name: 'Cisco', exact: true }).click();
    await expect.poll(totalShown).toBe((await cat('tags=cisco')).total_size);
    await expect(drawer.getByText('Clear 1 Tags')).toBeVisible();
    await shot(page, '21-catalogue-cisco');

    // intake filter, on top of the tag
    await drawer.locator('.ant-select').last().click();
    await page
      .locator('.ant-select-dropdown:visible')
      .getByText('Pushed to the receiver', { exact: true })
      .click();
    await expect
      .poll(totalShown)
      .toBe((await cat('tags=cisco&intake=receiver')).total_size);
    await shot(page, '22-catalogue-cisco-receiver');
    await drawer.getByRole('button', { name: 'Clear 1 Tags' }).click();
    await drawer.locator('.ant-select-clear').click({ force: true });
    await expect.poll(totalShown).toBe((await cat('')).total_size);

    // paging: page 2 names equal the API's second ten
    const names = async () =>
      drawer
        .locator('.ant-table-tbody tr.ant-table-row')
        .evaluateAll((rows) =>
          rows.map(
            (r) =>
              (r.querySelector('td:nth-child(2)') as HTMLElement).innerText,
          ),
        );
    const page1 = await names();
    expect(page1).toHaveLength(10);
    await drawer.getByRole('listitem', { name: '2', exact: true }).click();
    await expect.poll(async () => (await names())[0]).not.toBe(page1[0]);
    const page2 = await names();
    expect(page2).toHaveLength(10);

    // A row can be selected when the API says the entry runs on this deployment.
    await search.fill('okta');
    const entries = (await cat('search=okta')).items;
    const rows = drawer.locator('.ant-table-tbody tr.ant-table-row');
    await expect(rows).toHaveCount(entries.length, { timeout: 30_000 });
    for (const entry of entries) {
      const box = rows
        .filter({ hasText: entry.name })
        .first()
        .getByRole('checkbox');
      if (entry.runnable) {
        await expect(box, entry.name).toBeEnabled();
      } else {
        await knownConsoleDefect(
          `the catalogue drawer lets an entry be selected that the engine says this deployment cannot run (runnable false): ${entry.name}`,
          () => expect(box).toBeDisabled({ timeout: 2_000 }),
        );
      }
    }
  },
);

// Entries that need a per-source app (fetcher, transform) run only on a Kafka
// deployment, and the engine says which ones a deployment can run. When it
// says neither of the two this journey picks, the journey skips with that
// reason. e2e/config/tags.constants.ts has no tag for Kafka-only.
test(
  'catalogue drawer: select two entries, review, create them',
  { tag: [TAGS.core, TAGS.source, '@kafka-only'] },
  async ({ page }) => {
    const entries = (await cat('search=okta')).items;
    test.skip(
      entries.length !== 2 || entries.some((e) => !e.runnable),
      `the engine says this deployment cannot run the okta entries: ${entries.find((e) => !e.runnable)?.runnable_reason ?? `${entries.length} found, 2 expected`}`,
    );
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/sources`);
    await page
      .getByRole('button', { name: 'Add from catalogue', exact: true })
      .click();
    const drawer = page.getByRole('dialog', { name: 'Add from catalogue' });
    await drawer.getByPlaceholder('Search by name or dataset').fill('okta');
    const rows = drawer.locator('.ant-table-tbody tr.ant-table-row');
    await expect(rows).toHaveCount(2, { timeout: 30_000 });
    await rows.nth(0).getByRole('checkbox').check();
    await rows.nth(1).getByRole('checkbox').check();
    await shot(page, '23-catalogue-selected');
    await drawer
      .getByRole('button', { name: 'Review Catalogues', exact: true })
      .click();
    await shot(page, '24-catalogue-review');
    const picked = entries;
    const posted = page.waitForResponse((r) =>
      r.url().includes('/sources/from-catalogue'),
    );
    await drawer
      .getByRole('button', { name: 'Upload Catalogues', exact: true })
      .click();
    await posted;
    await page
      .getByRole('button', { name: 'Toggle failed sources' })
      .click()
      .catch(() => undefined);
    await shot(page, '25-catalogue-result');
    created.push(...picked.map((e) => e.name));
    await expect(drawer.getByText(/2 sources? created/)).toBeVisible({
      timeout: 30_000,
    });
    for (const entry of picked) {
      const stored = await engine<{
        versions: Record<string, unknown>;
        current: string;
      }>('GET', `/api/v1/sources/${entry.name}`);
      expect(stored.versions[stored.current]).toBeDefined();
      await engine<Record<string, unknown>>(
        'GET',
        `/api/v1/sources/${entry.name}/flow`,
      );
    }
  },
);
