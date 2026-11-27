import { Page, expect } from '@playwright/test';

import { clickhouse, qualifiedTable } from '@e2e/config/engineApi.helpers';
import { deleteIfPresent } from '@e2e/specs/Journeys/Sources/sources.helpers';
import {
  addSourceInUi,
  buildAndDeployInUi,
  submitDrawer,
} from '@e2e/specs/Journeys/Sources/ui.helpers';

import { sendEvents } from './createRuleStored.helpers';

export const SOURCE = 'jcrs-own';
export const DATASET = 'jcrs_own.log';
export const FAILED = 'login failed for jo bloggs';

/** One Elastic Agent event for the own-table source, carrying the run's mark. */
export const ownEvent = (
  mark: string,
  batch: string,
  id: number,
  message: string,
  user: string,
  agent: string,
) => ({
  '@timestamp': new Date().toISOString(),
  agent: { name: agent, type: 'filebeat' },
  data_stream: { dataset: DATASET, namespace: 'ep', type: 'logs' },
  event: { dataset: DATASET },
  cr_mark: mark,
  cr_id: id,
  cr_batch: batch,
  user: { name: user },
  message,
});

/** Four events. A search for the failed-login message from jo bloggs or crs-agent keeps 1 and 4. */
export const ownBatch = (mark: string, batch: string) => [
  ownEvent(mark, batch, 1, FAILED, 'jo bloggs', 'crs-agent'),
  ownEvent(mark, batch, 2, FAILED, 'sam', 'other'),
  ownEvent(mark, batch, 3, 'login ok for jo bloggs', 'jo bloggs', 'crs-agent'),
  ownEvent(mark, batch, 4, FAILED, 'x', 'crs-agent'),
];

export const dropOwnSource = async () => {
  await deleteIfPresent(SOURCE);
  await clickhouse(`DROP TABLE IF EXISTS ${await qualifiedTable(SOURCE)}`);
};

/** Create the source in the console, deploy it, and wait until the receiver routes to its table. */
export const deployOwnSource = async (page: Page) => {
  const drawer = await addSourceInUi(page, {
    name: SOURCE,
    display: 'CR own source',
    field: 'data_stream.dataset',
    value: DATASET,
    ownTable: true,
    metaSchema: 'filebeat',
  });
  await submitDrawer(page, drawer);
  await buildAndDeployInUi(page, SOURCE);
  // The receiver reloads its routing a while after the deploy answers, so a
  // probe goes in on each poll until one reaches the table.
  await expect
    .poll(
      async () => {
        await sendEvents([ownEvent('probe', 'probe', 0, 'probe', 'p', 'p')]);
        return clickhouse(
          `SELECT count() FROM ${await qualifiedTable(SOURCE)}`,
        );
      },
      { timeout: 150_000, intervals: [8_000] },
    )
    .not.toBe('0');
};
