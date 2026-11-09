import path from 'node:path';

import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { shot } from '@e2e/config/journey.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import {
  MOCKS,
  SCHEMAS,
  columnsOf,
  engineAll,
  fillIdentity,
  forgetSchema,
  openAddSchema,
  reviewAndCreate,
  scrollRowsIn,
  shownColumnCount,
  signIn,
} from './schemas.helpers';

/**
 * A meta schema read from an Elastic index template: what the console shows,
 * what the engine pages back column by column, and what a scroll reaches. The
 * add, version, clone and delete flows are in e2e/specs/Schemas.
 */
test.describe.configure({ timeout: 180_000 });

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await page.goto(`${BASE_URL}${SCHEMAS}`);
});

test.afterEach(async ({ request }) => {
  await forgetSchema(request, 'meta/jsch_elastic');
});

test.describe('', { tag: [TAGS.core, TAGS.schema] }, () => {
  test('jsch-meta: a schema read from an Elastic template matches the engine and loads every column', async ({
    page,
    request,
  }) => {
    await forgetSchema(request, 'meta/jsch_elastic');
    const drawer = await openAddSchema(page);
    await fillIdentity(drawer, {
      name: 'jsch_elastic',
      description: 'Read from an Elastic index template',
    });
    await drawer.getByText('ELASTIC INDEX TEMPLATE', { exact: true }).click();
    await drawer
      .locator('input[type="file"]')
      .setInputFiles(path.join(MOCKS, 'elasticUpload.json'));
    await expect(drawer.getByText('tags', { exact: true })).toBeVisible({
      timeout: 30_000,
    });
    await shot(page, 'meta-elastic-filled');
    await reviewAndCreate(page, 'tags', 'meta-elastic');
    await expect(page.getByText('meta/jsch_elastic.yml')).toBeVisible({
      timeout: 30_000,
    });
    const shown = await shownColumnCount(page);

    const listed = await engineAll(
      request,
      '/schemas?schema_type=meta&search=jsch_elastic',
    );
    const columns = await columnsOf(request, 'meta/jsch_elastic', '1.0.0');
    // page_size 7 forces several token hops over the same data
    const small = await engineAll(
      request,
      '/schemas/definitions/meta/jsch_elastic/versions/columns?version=1.0.0',
      7,
    );
    expect(small.pages).toBeGreaterThan(1);
    expect(small.items.map((c) => c.name)).toEqual(
      columns.items.map((c) => c.name),
    );
    expect(listed.items[0].column_count).toBe(columns.total);
    expect(shown).toBe(columns.total);
    expect(columns.total).toBeGreaterThan(50);

    // Rows the user can actually reach by scrolling
    const { count } = await scrollRowsIn(page, columns.total);
    await shot(page, 'meta-elastic-scrolled');
    expect(count).toBe(columns.total);
    await forgetSchema(request, 'meta/jsch_elastic');
  });
});
