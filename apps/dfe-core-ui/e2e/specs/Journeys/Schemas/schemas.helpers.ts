/* eslint-disable @typescript-eslint/no-explicit-any -- the engine replies are read as loose JSON */
import path from 'node:path';

import { APIRequestContext, Page, expect } from '@playwright/test';

import { ENGINE_API_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, shot } from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';

export const MOCKS = path.join(__dirname, '../../../mocks');
export const SCHEMAS = '/schemas/meta-schemas';

export const signIn = async (page: Page) => {
  await loginAs(page, JOURNEY_USER);
};

export const engineGet = async <T = any>(
  request: APIRequestContext,
  url: string,
): Promise<T> => {
  const response = await request.get(`${ENGINE_API_URL}/api/v1${url}`, {
    headers: { Authorization: `Bearer ${await engineToken()}` },
  });
  expect(response.ok(), `${url} -> ${response.status()}`).toBeTruthy();
  return (await response.json()) as T;
};

/** Every page of a token-paged list, followed by next_page_token. */
export const engineAll = async (
  request: APIRequestContext,
  url: string,
  pageSize = 25,
) => {
  const items: any[] = [];
  let token: string | undefined;
  let total = 0;
  let pages = 0;
  do {
    const sep = url.includes('?') ? '&' : '?';
    const body = await engineGet<{
      items: any[];
      next_page_token?: string | null;
      total_size: number;
    }>(
      request,
      `${url}${sep}page_size=${pageSize}${token ? `&page_token=${encodeURIComponent(token)}` : ''}`,
    );
    items.push(...body.items);
    total = body.total_size;
    token = body.next_page_token || undefined;
    pages += 1;
  } while (token);
  return { items, total, pages };
};

export const columnsOf = async (
  request: APIRequestContext,
  schemaPath: string,
  version?: string,
) =>
  engineAll(
    request,
    `/schemas/definitions/${schemaPath}/versions/columns${version ? `?version=${version}` : ''}`,
    1000,
  );

export const forgetSchema = async (
  request: APIRequestContext,
  schemaPath: string,
) => {
  const token = await engineToken();
  const kind = schemaPath.startsWith('derived/') ? '/derived' : '';
  const name = schemaPath.replace(/^derived\//, '');
  const removed = await request.delete(
    `${ENGINE_API_URL}/api/v1/schemas/definitions${kind}/${name}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  expect([200, 204, 404]).toContain(removed.status());
};

/** The schema drawers' steps, in the shapes e2e/specs/Schemas uses. */
export const openAddSchema = async (page: Page) => {
  await page.getByRole('button', { name: 'Add Schema', exact: true }).click();
  return page.getByRole('dialog', { name: 'Add Schema' });
};

export const fillIdentity = async (
  drawer: ReturnType<Page['getByRole']>,
  schema: { name: string; description: string },
) => {
  await drawer.getByRole('textbox', { name: /^Name/ }).fill(schema.name);
  await drawer
    .getByRole('textbox', { name: /^Description/ })
    .fill(schema.description);
};

export const reviewAndCreate = async (
  page: Page,
  column: string,
  tag: string,
) => {
  const drawer = page.getByRole('dialog');
  await drawer
    .getByRole('button', { name: 'Review Schema', exact: true })
    .click();
  const review = page.getByRole('dialog', { name: /Review Schema/ });
  await expect(
    review.getByRole('cell', { name: column, exact: true }),
  ).toBeVisible();
  await shot(page, `${tag}-review`);
  await review
    .getByRole('button', { name: 'Create Schema', exact: true })
    .click();
  await expect(page.getByText('Schema created successfully')).toBeVisible({
    timeout: 30_000,
  });
};

/** The "N columns" the detail header shows. */
export const shownColumnCount = async (page: Page): Promise<number> => {
  const label = page.getByText(/^\d+ columns?$/).first();
  await expect(label).toBeVisible({ timeout: 30_000 });
  return Number((await label.innerText()).split(' ')[0]);
};

const ROWS = '.ant-table-tbody tr[data-row-key]';

/**
 * Scroll the table the way a user does until rows stop arriving.
 * Returns the rows the UI ended up holding and how many scroll steps it took.
 */
export const scrollRowsIn = async (
  page: Page,
  expected: number,
  rows = ROWS,
) => {
  let steps = 0;
  let stale = 0;
  let last = -1;
  while (stale < 4) {
    const count = await page.locator(rows).count();
    if (count >= expected) {
      return { count, steps };
    }
    stale = count === last ? stale + 1 : 0;
    last = count;
    await page.locator(rows).last().scrollIntoViewIfNeeded();
    await page.evaluate((sel) => {
      const row = document.querySelector(sel);
      let el: HTMLElement | null = row as HTMLElement | null;
      while (el && el.scrollHeight <= el.clientHeight + 1) {
        el = el.parentElement;
      }
      if (el) el.scrollTop = el.scrollHeight;
    }, rows);
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(700);
    steps += 1;
  }
  return { count: await page.locator(rows).count(), steps };
};
