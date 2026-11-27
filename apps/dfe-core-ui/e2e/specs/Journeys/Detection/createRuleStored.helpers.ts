import { Page, expect } from '@playwright/test';

import { clickhouse, engine } from '@e2e/config/engineApi.helpers';
import { ingestToken } from '@e2e/config/ingestToken.helpers';
import { RECEIVER_URL } from '@e2e/config/filebeatCorpus.helpers';

import { engineClient } from './detection.helpers';

type Api = ReturnType<typeof engineClient>;

export type StoredRule = {
  name: string;
  display_name: string;
  severity: string;
  source_db: string;
  source_table: string;
  where_clause: string;
  original_sql: string;
};

export const storedRule = (name: string) =>
  engine<StoredRule>('GET', `/api/v1/rules/${name}`);

export const ruleTotal = async () =>
  (await engine<{ total_size: number }>('GET', '/api/v1/rules?page_size=1'))
    .total_size;

/** A rule holds the search's filter, bound to its table, and nothing else HyperDX added. */
export const expectFilterOnly = (rule: StoredRule, table: string) => {
  expect(rule.source_db).toBe('dfe');
  expect(rule.source_table).toBe(table);
  expect(rule.where_clause).not.toMatch(/\bORDER BY\b|\bLIMIT\b|\bSELECT\b/i);
  expect(rule.where_clause).not.toMatch(/fromUnixTimestamp64Milli/);
  expect(rule.where_clause).not.toMatch(/\b_timestamp(_load)?\b/);
};

/** Send events to the receiver, which routes them by what they carry. */
export const sendEvents = async (events: object[]) => {
  const reply = await fetch(`${RECEIVER_URL}/ingest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await ingestToken(RECEIVER_URL)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(events),
  });
  expect(reply.status, await reply.clone().text()).toBe(202);
};

/** Wait until n rows carrying the mark are in the table. */
export const expectLanded = (table: string, mark: string, n: number) =>
  expect
    .poll(
      async () =>
        Number(
          await clickhouse(
            `SELECT count() FROM dfe.\`${table}\` WHERE toString(_json) LIKE '%${mark}%'`,
          ),
        ),
      { timeout: 120_000, intervals: [2_000] },
    )
    .toBe(n);

/**
 * A hunt over one rule. It reads forward from its checkpoint, so the events it
 * should find are sent after it exists.
 */
export const createHunt = async (
  api: Api,
  hunt: string,
  rule: StoredRule,
  customer: string,
) => {
  await api.del(`/hunts/${hunt}`);
  const made = await api.post('/hunts', {
    name: hunt,
    display_name: hunt,
    cron: '*/15 * * * *',
    customers: [customer],
    global_source_table_name: rule.source_table,
    rules: [rule.name],
  });
  expect(made.ok(), await made.text()).toBeTruthy();
};

/** Run the hunt on demand once the events have aged past its own second. */
export const runHunt = async (page: Page, api: Api, hunt: string) => {
  await page.waitForTimeout(2_500);
  const queued = await api.post(`/hunts/${hunt}/run`);
  expect(queued.status(), await queued.text()).toBe(202);
};

/** The values of one JSON field across the events the hunt matched for the rule, sorted. */
export const matched = async (
  hunt: string,
  ruleId: string,
  mark: string,
  field: string,
) =>
  clickhouse(
    `SELECT arraySort(groupUniqArray(toString(_json.${field}))) FROM dfe.detection WHERE hunt_name = '${hunt}' AND rule_id = '${ruleId}' AND _json.cr_mark = '${mark}' FORMAT TSV`,
  );

/** How many events of one batch the hunt matched for the rule, counted once each. */
export const matchedInBatch = async (
  hunt: string,
  ruleId: string,
  mark: string,
  batch: string,
) =>
  Number(
    await clickhouse(
      `SELECT count(DISTINCT matched_uuid) FROM dfe.detection WHERE hunt_name = '${hunt}' AND rule_id = '${ruleId}' AND _json.cr_mark = '${mark}' AND _json.cr_batch = '${batch}'`,
    ),
  );

/** The rule page a created rule opens in, edited to a new severity and saved. */
export const editSeverity = async (editor: Page, from: string, to: string) => {
  await editor.locator('button:has(svg[class*="menu-2"])').first().click();
  await editor.getByRole('button', { name: 'Edit Rule' }).click();
  await expect(editor.getByRole('button', { name: 'Update Rule' })).toBeVisible(
    { timeout: 20_000 },
  );
  await editor.getByTitle(from).click();
  await editor.getByTitle(to).click();
  await editor.getByRole('button', { name: 'Update Rule' }).click();
  await expect(editor.locator('.ant-notification')).toContainText('updated', {
    timeout: 20_000,
  });
};
