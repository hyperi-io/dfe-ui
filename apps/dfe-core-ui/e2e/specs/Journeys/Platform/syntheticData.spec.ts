import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { clickhouse } from '@e2e/config/engineApi.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { ADMIN, api, shot } from './platform.helpers';

/* The console has no synthetic-data screen, so this drives the engine API. */
type Op = {
  name: string;
  done: boolean;
  metadata: { id: string; kind: string; status: string; progress: number };
  response: { emitted: number; sent: number; failed: number } | null;
};

/* The ingest URL as the engine reaches it, e.g. http://dfe-receiver:8080/ingest */
const RECEIVER = process.env.DFE_RECEIVER_URL_FROM_ENGINE ?? '';
test.skip(!RECEIVER, 'set DFE_RECEIVER_URL_FROM_ENGINE');

const tagged = async (tag: string) =>
  Number(
    await clickhouse(
      `SELECT count() FROM dfe.main WHERE _tags.jplat = '${tag}'`,
    ),
  );
const start = (tag: string, count: number, rate: number) =>
  api<Op>('POST', '/api/v1/synthetic-data/stream', {
    schema: 'meta/aws/health',
    count,
    rate_eps: rate,
    receiver_url: RECEIVER,
    tags: { jplat: tag },
    batch_max: 5,
  });
const op = async (id: string) =>
  (await api<Op>('GET', `/api/v1/operations/${id}`)).body;

test(
  'Synthetic data: stream lands rows and the operation reports it',
  { tag: [TAGS.core, TAGS.docker] },
  async ({ page }) => {
    const tag = `run-${Date.now().toString(36)}`;
    const accepted = await start(tag, 25, 50);
    expect(accepted.status).toBe(202);
    const id = accepted.body.metadata.id;
    expect(accepted.body.name).toBe(`operations/${id}`);
    expect(accepted.body.metadata.kind).toBe('synthetic-data:stream');

    await expect
      .poll(async () => (await op(id)).done, { timeout: 30_000 })
      .toBe(true);
    const done = await op(id);
    const stream = (
      await api<Op>('GET', `/api/v1/synthetic-data/streams/${id}`)
    ).body;
    expect(done.metadata.status).toBe('completed');
    expect(done.response).toMatchObject({ emitted: 25, sent: 25, failed: 0 });
    expect(stream.metadata).toEqual(done.metadata);
    const listed = await api<{ items: Op[] }>(
      'GET',
      '/api/v1/operations?page_size=50',
    );
    expect(listed.body.items.map((o) => o.metadata.id)).toContain(id);

    await expect.poll(() => tagged(tag), { timeout: 60_000 }).toBe(25);
    await loginAs(page, ADMIN);
    await page.goto(`${BASE_URL}/sources`);
    await shot(page, 'synthetic-console-has-no-screen');
  },
);

test(
  'Synthetic data: cancel stops the stream before it finishes',
  { tag: [TAGS.core, TAGS.docker] },
  async () => {
    const tag = `cancel-${Date.now().toString(36)}`;
    const id = (await start(tag, 5000, 20)).body.metadata.id;
    await expect
      .poll(async () => (await op(id)).metadata.status, { timeout: 20_000 })
      .toBe('running');
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const cancel = await api<Op>('POST', `/api/v1/operations/${id}/cancel`);
    expect(cancel.status).toBeLessThan(300);
    await expect
      .poll(async () => (await op(id)).done, { timeout: 20_000 })
      .toBe(true);
    expect((await op(id)).metadata.status).toBe('cancelled');
    await expect
      .poll(() => tagged(tag), { timeout: 30_000 })
      .toBeGreaterThan(0);
    expect(await tagged(tag)).toBeLessThan(5000);
  },
);
