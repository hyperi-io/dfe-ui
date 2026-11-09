import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import {
  clickhouse,
  engine,
  qualifiedTable,
} from '@e2e/config/engineApi.helpers';
import { pushEnvelopes } from '@e2e/config/filebeatCorpus.helpers';
import {
  JOURNEY_USER,
  prepareJourneyStack,
  shot,
} from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { deleteIfPresent, envelope } from './sources.helpers';
import { addSourceInUi, buildAndDeployInUi, submitDrawer } from './ui.helpers';

prepareJourneyStack();

// UI create -> API stored -> build + deploy -> receiver POST -> ClickHouse row
// -> console Sample Events and Columns tabs.
const SOURCE = 'jsrc-datapath';
const DATASET = 'jsrc_datapath.log';

test.setTimeout(240_000);

const wipe = async () => {
  await deleteIfPresent(SOURCE);
  await clickhouse(`DROP TABLE IF EXISTS ${await qualifiedTable(SOURCE)}`);
};
test.beforeAll(wipe);
test.afterAll(wipe);

test(
  'a source created in the console takes data from the receiver to its table',
  { tag: [TAGS.core, TAGS.source, TAGS.docker] },
  async ({ page }) => {
    await loginAs(page, JOURNEY_USER);
    const drawer = await addSourceInUi(page, {
      name: SOURCE,
      display: 'JSRC Data Path',
      field: 'data_stream.dataset',
      value: DATASET,
      ownTable: true,
      metaSchema: 'filebeat',
    });
    await shot(page, '01-create-drawer');
    await submitDrawer(page, drawer);

    const stored = await engine<{
      display_name: string;
      current: string;
      versions: Record<
        string,
        { match: object; schema: { meta_schema: string } }
      >;
    }>('GET', `/api/v1/sources/${SOURCE}`);
    const version = stored.versions[stored.current];
    expect(stored.display_name).toBe('JSRC Data Path');
    expect(version.match).toEqual({
      field: 'data_stream.dataset',
      operator: 'equals',
      value: DATASET,
    });
    expect(version.schema.meta_schema).toContain('filebeat');

    await buildAndDeployInUi(page, SOURCE);
    await shot(page, '02-deployed');
    const table = await qualifiedTable(SOURCE);
    expect(await clickhouse(`EXISTS TABLE ${table}`)).toBe('1');

    const run = `${Date.now()}`;
    const count = async (from: string, where = '1') =>
      Number(await clickhouse(`SELECT count() FROM ${from} WHERE ${where}`));

    // The receiver and loader reload their routing a while after the deploy
    // answers, and a record sent before that lands on main. A probe goes in
    // until one reaches the source's own table.
    await expect
      .poll(
        async () => {
          await pushEnvelopes([envelope(DATASET, `journey probe ${run}`, run)]);
          await new Promise((done) => setTimeout(done, 8_000));
          return count(table);
        },
        { timeout: 150_000 },
      )
      .toBeGreaterThan(0);
    const probes = await count(table);

    await pushEnvelopes(
      [1, 2, 3].map((n) => envelope(DATASET, `journey event ${n} ${run}`, run)),
    );
    await expect
      .poll(() => count(table), { timeout: 90_000, intervals: [2_000] })
      .toBe(probes + 3);
    expect(
      await count(
        table,
        `JSONExtractString(toString(_json), 'data_stream', 'dataset') = '${DATASET}'`,
      ),
    ).toBe(probes + 3);
    expect(
      await count(
        await qualifiedTable('main'),
        `toString(_json) LIKE '%journey event % ${run}%'`,
      ),
    ).toBe(0);

    await page.goto(
      `${BASE_URL}/sources?source_name=${SOURCE}&tab=sample-events`,
    );
    await expect(page.getByText(/…\d+ keys/)).toHaveCount(probes + 3, {
      timeout: 30_000,
    });
    await page
      .getByText(/…\d+ keys/)
      .first()
      .click();
    await shot(page, '03-sample-events');
    await expect(
      page.getByText(new RegExp(`journey event \\d ${run}`)).first(),
    ).toBeVisible({
      timeout: 30_000,
    });
    const samples = await engine<{ rows: unknown[] }>(
      'GET',
      `/api/v1/schemas/${SOURCE}/sample-rows?version=${stored.current}`,
    );
    expect(samples.rows).toHaveLength(probes + 3);

    await page.getByRole('tab', { name: 'Columns', exact: true }).click();
    await expect(
      page.getByRole('tab', { name: 'Columns', exact: true, selected: true }),
    ).toBeVisible();
    const cols = await engine<{ total_size: number; items: unknown[] }>(
      'GET',
      `/api/v1/schemas/${SOURCE}/columns?page_size=1000`,
    );
    await expect(page.getByText(`${cols.total_size} columns`)).toBeVisible();
    await shot(page, '04-columns');
  },
);
