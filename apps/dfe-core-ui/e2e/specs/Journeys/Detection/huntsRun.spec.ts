import { expect as baseExpect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { clickhouse, engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, shot } from '@e2e/config/journey.helpers';
import { RECEIVER_URL } from '@e2e/config/filebeatCorpus.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import {
  apiCreateRule,
  dropSource,
  ensureSource,
  engineClient,
} from './detection.helpers';

/**
 * A user creates a hunt over a rule, runs it on demand, and the detections land
 * in ClickHouse. The engine API and the console agree on the hunt as created.
 */
const HUNT = 'jdet-hunt-run';
const RULE = 'jdet-hunt-rule';
const MARK = `jdet-${Date.now()}`;

// The engine answers slowly while other sessions share the stack.
const expect = baseExpect.configure({ timeout: 20_000 });

test.setTimeout(240_000);
test.use({ actionTimeout: 15_000 });

test(
  'Hunt: create, run on demand, detections land',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page, request }) => {
    const api = engineClient(request, await engineToken());
    const madeSource = await ensureSource(api);
    await api.del(`/hunts/${HUNT}`);
    await api.del(`/rules/${RULE}`);
    await apiCreateRule(api, RULE, {
      severity: 'high',
      user_sql: `SELECT * FROM dfe.main WHERE _source = 'jdet-src' AND _json.jdet_mark = '${MARK}'`,
    });

    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/hunts`);
    await page.getByRole('button', { name: 'Add Hunt' }).first().click();
    await page.getByRole('textbox', { name: /Name/ }).first().fill(HUNT);
    await page
      .getByRole('textbox', { name: 'Display Name' })
      .fill('JDET Hunt Run');
    const selects = page.locator('.ant-select');
    // The list can open empty while the organisations load: reopen until it fills.
    await expect(async () => {
      await selects.nth(0).click();
      await page
        .locator('.ant-select-item-option', { hasText: 'Default' })
        .click({ timeout: 8_000 });
    }).toPass({ timeout: 60_000 });
    await page.keyboard.press('Escape');
    await selects.nth(1).click();
    await shot(page, 'hunts-source-options');
    await page.getByTitle('main').first().click();
    await selects.nth(2).click();
    await page.getByTitle(RULE).first().click();
    await page.keyboard.press('Escape');
    await shot(page, 'hunts-create-filled');
    await page.getByRole('button', { name: 'Add Hunt' }).last().click();
    await expect(page.getByText('Hunt created successfully')).toBeVisible({
      timeout: 30_000,
    });
    await shot(page, 'hunts-created');

    const made = await (await api.get(`/hunts/${HUNT}`)).json();
    expect(made.name).toBe(HUNT);
    expect(made.display_name).toBe('JDET Hunt Run');
    expect(made.customers).toEqual(['default']);
    expect(made.global_source_table_name).toBe('main');
    expect(made.rules.map((r: { rule_name: string }) => r.rule_name)).toEqual([
      RULE,
    ]);
    expect(made.cron).toBe('*/15 * * * *');

    // The list and detail show what the engine holds
    await page.goto(`${BASE_URL}/hunts`);
    await expect(page.getByText('1 of 1 result')).toBeVisible();
    await page.getByText('JDET Hunt Run', { exact: true }).click();
    await expect(page.getByText(RULE).first()).toBeVisible();
    await shot(page, 'hunts-detail');

    // Events that arrive after the hunt exists: a hunt reads forward from its checkpoint.
    for (const n of [1, 2]) {
      const r = await request.post(`${RECEIVER_URL}/ingest`, {
        data: { jdet_kind: 'jdet', jdet_mark: MARK, jdet_n: n, level: 'high' },
      });
      expect(r.status()).toBe(202);
    }
    await expect
      .poll(
        () =>
          clickhouse(
            `SELECT count() FROM dfe.main WHERE _json.jdet_mark = '${MARK}'`,
          ),
        {
          timeout: 60_000,
        },
      )
      .toBe('2');

    // RUN ON DEMAND. A fire reads _timestamp_load strictly before its own second, so let the events age past it.
    await page.waitForTimeout(2500);
    await page.getByRole('button', { name: /Trigger On-Demand/ }).click();
    await page.getByRole('button', { name: 'Trigger Hunt' }).click();
    await expect(page.getByText('On-demand run queued')).toBeVisible();
    await shot(page, 'hunts-triggered');

    // The engine ran it: detections for exactly the two marked events land
    const marked = `SELECT count() FROM dfe.detection WHERE hunt_name = '${HUNT}' AND rule_name = '${RULE}' AND _json.jdet_mark = '${MARK}'`;
    await expect
      .poll(() => clickhouse(marked), { timeout: 150_000, intervals: [5_000] })
      .toBe('2');
    expect(
      await clickhouse(
        `SELECT DISTINCT severity FROM dfe.detection WHERE hunt_name = '${HUNT}' AND _json.jdet_mark = '${MARK}'`,
      ),
    ).toBe('high');
    expect(
      await clickhouse(
        `SELECT count(DISTINCT matched_uuid) FROM dfe.detection WHERE hunt_name = '${HUNT}' AND _json.jdet_mark = '${MARK}'`,
      ),
    ).toBe('2');

    // The engine's own run record agrees
    await expect
      .poll(async () => {
        const list = await (await api.get(`/hunts?search=${HUNT}`)).json();
        return list.items[0]?.last_run_rows;
      })
      .toBeGreaterThanOrEqual(2);

    // The console's Hunt Results page shows the same detections ClickHouse holds
    await page.goto(`${BASE_URL}/observe/hunt-results`);
    await expect(
      page
        .frameLocator('iframe')
        .first()
        .getByText(/\d+ Results?/)
        .first(),
    ).toBeVisible({ timeout: 60_000 });
    const shown = await page
      .frameLocator('iframe')
      .first()
      .getByText(/\d+ Results?/)
      .first()
      .innerText();
    const held = await clickhouse(
      'SELECT count() FROM dfe.detection WHERE _timestamp >= now() - INTERVAL 15 MINUTE',
    );
    expect(Number.parseInt(shown, 10)).toBeGreaterThanOrEqual(2);
    expect(
      Math.abs(Number.parseInt(shown, 10) - Number.parseInt(held, 10)),
    ).toBeLessThanOrEqual(1);
    await shot(page, 'hunts-results-page');

    // DELETE through the console
    await page.goto(`${BASE_URL}/hunts`);
    await page.getByText('JDET Hunt Run', { exact: true }).click();
    await page.locator('button:has(svg[class*="menu-2"])').first().click();
    await page.getByRole('button', { name: 'Delete Hunt' }).click();
    await shot(page, 'hunts-delete-confirm');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    await expect
      .poll(async () => (await api.get(`/hunts/${HUNT}`)).status())
      .toBe(404);
    await api.del(`/rules/${RULE}`);
    if (madeSource) await dropSource(api);
  },
);
