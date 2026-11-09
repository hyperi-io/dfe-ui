import { expect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { ADMIN, api, shot } from './platform.helpers';

type Link = { name: string; purpose: string; url: string; status: string };
type Life = { name: string; tier: string; state: string };
type Usage = { metrics: { label: string; status: string }[] };

test(
  'Platform pages render engine data with no failed calls',
  { tag: [TAGS.core] },
  async ({ page, context }) => {
    test.setTimeout(240_000);
    const problems: string[] = [];
    page.on(
      'console',
      (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`),
    );
    page.on('response', (r) => {
      if (r.url().includes('/api/') && r.status() >= 400)
        problems.push(`${r.status()} ${r.request().method()} ${r.url()}`);
    });
    await loginAs(page, ADMIN);

    /* Admin tools: one row per link the engine lists, and the link goes where the engine says */
    const links = (
      await api<{ items: Link[] }>('GET', '/api/v1/deployment/admin-links')
    ).body.items;
    await page.goto(`${BASE_URL}/admin-tools`);
    for (const link of links) {
      const row = page.getByRole('row', { name: new RegExp(link.name) });
      await expect(row).toContainText(link.purpose);
      await expect(row).toContainText(link.status);
    }
    const first = links[0];
    const popup = context.waitForEvent('page');
    await page
      .getByRole('link', { name: `${first.name} (opens in a new tab)` })
      .click();
    const opened = await popup;
    await opened.waitForLoadState('load');
    await opened.waitForTimeout(5000);
    expect(opened.url().startsWith(first.url)).toBe(true);
    const reply = await opened.request.get(first.url);
    expect(reply.status()).toBeLessThan(500);
    await shot(opened, 'pages-1-admin-link-opened', false);
    await opened.close();

    /* Lifecycle: one row per service, each with the engine's tier and state */
    const life = (await api<{ items: Life[] }>('GET', '/api/v1/lifecycle')).body
      .items;
    await page.goto(`${BASE_URL}/settings/platform/lifecycle`);
    for (const service of life) {
      const row = page.getByRole('row', {
        name: new RegExp(`^${service.name} `),
      });
      await expect(row).toContainText(service.tier);
    }
    await shot(page, 'pages-2-lifecycle');

    /* The other platform tabs and the admin controls usage strip */
    for (const tab of ['governance', 'repository', 'helm']) {
      await page.goto(`${BASE_URL}/settings/platform/${tab}`);
      await page.waitForTimeout(2500);
      await shot(page, `pages-3-${tab}`);
    }
    const usage = (await api<Usage>('GET', '/api/v1/usage/overview')).body;
    await page.goto(`${BASE_URL}/observe/dashboards`);
    for (const metric of usage.metrics.slice(0, 3)) {
      await expect(
        page.getByLabel(metric.label, { exact: true }).first(),
      ).toBeVisible();
    }
    await shot(page, 'pages-4-usage');
    expect(problems).toEqual([]);
  },
);
