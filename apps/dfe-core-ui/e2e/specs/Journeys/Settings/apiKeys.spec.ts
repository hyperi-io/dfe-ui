import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';

import {
  ADMIN,
  adminApi,
  adminPage,
  callWith,
  choose,
  shot,
  stamp,
} from './settings.helpers';

test.setTimeout(75_000);

test.describe('jset: API keys', { tag: [TAGS.core, TAGS.settings] }, () => {
  test('create a key in the console, use it, revoke it, and it stops working', async ({
    page,
  }) => {
    const name = `jset-key-${stamp()}`;
    const admin = await adminApi();
    await adminPage(page);
    await page.goto(`${ADMIN}/api-key-management`);

    await page
      .getByRole('button', { name: 'Generate API Key', exact: true })
      .click();
    const dlg = page.getByRole('dialog', { name: 'Generate API Key' });
    await dlg.getByRole('textbox', { name: 'Name', exact: true }).fill(name);
    await dlg
      .getByRole('textbox', { name: 'Description', exact: true })
      .fill('jset key');
    await choose(page, dlg, 'Select groups', 'dfe-viewers');
    await dlg
      .getByRole('textbox', { name: 'Description', exact: true })
      .click();
    await shot(page, 'key-create-dialog');
    await dlg.getByRole('button', { name: 'Generate', exact: true }).click();

    const done = page.getByRole('dialog', { name: 'API Key Generated' });
    await expect(done).toBeVisible();
    await done.getByRole('button', { name: 'Toggle visibility' }).click();
    const fullKey = (await done.locator('pre code').innerText()).trim();
    expect(fullKey).toMatch(/^dfe_ak_/);
    await shot(page, 'key-generated');
    await done
      .getByRole('button', { name: 'I have copied the API key', exact: true })
      .click();

    const list = await admin('GET', '/api/v1/auth/api-keys?page_size=100');
    const meta = list.json.items.find((k: { name: string }) => k.name === name);
    expect(meta).toMatchObject({
      name,
      groups: ['dfe-viewers'],
      enabled: true,
    });
    expect(fullKey).toContain(meta.short_token);
    expect(meta.groups).toEqual(['dfe-viewers']);
    expect(JSON.stringify(meta)).not.toContain(fullKey);

    const k = { 'X-API-Key': fullKey };
    const read = await callWith(k, 'GET', '/api/v1/sources');
    expect(
      read.status,
      'a key made in the console with a group chosen can read sources',
    ).toBe(200);
    const write = await callWith(k, 'POST', '/api/v1/sources', {
      name: `jset-nosrc-${name.slice(-6)}`,
    });
    const readUsers = await callWith(k, 'GET', '/api/v1/auth/accounts');
    expect(write.status).toBe(403);
    expect(readUsers.status).toBe(403);
    expect(
      (
        await callWith(
          { Authorization: `Bearer ${fullKey}` },
          'GET',
          '/api/v1/sources',
        )
      ).status,
      'an API key is not a bearer token',
    ).toBe(401);

    await page.getByPlaceholder('Search', { exact: true }).fill(name);
    const row = page.getByRole('row', { name: new RegExp(`\\s${name}\\s`) });
    await expect(row).toBeVisible();
    await shot(page, 'key-list');
    await row
      .getByRole('button', { name: 'Revoke API Key', exact: true })
      .click();
    const revoke = page.getByRole('dialog').filter({ hasText: name });
    await revoke
      .getByRole('button', { name: 'Revoke API Key', exact: true })
      .click();
    await expect(row).toHaveCount(0);

    const after = await callWith(k, 'GET', '/api/v1/sources');
    expect(after.status).toBe(401);
    const gone = await admin('GET', '/api/v1/auth/api-keys?page_size=100');
    expect(gone.json.items.map((x: { name: string }) => x.name)).not.toContain(
      name,
    );
  });

  test("a key bound to a real group carries that group's scopes, and revoke ends it", async () => {
    const admin = await adminApi();
    const name = `jset-gkey-${stamp()}`;
    const made = await admin('POST', '/api/v1/auth/api-keys', {
      name,
      description: 'jset',
      groups: ['dfe-viewers'],
      org: '',
    });
    expect(made.status).toBe(201);
    const k = { 'X-API-Key': made.json.full_key };
    expect((await callWith(k, 'GET', '/api/v1/sources')).status).toBe(200);
    expect(
      (await callWith(k, 'POST', '/api/v1/sources', { name: 'jset-nosrc' }))
        .status,
    ).toBe(403);
    expect((await callWith(k, 'GET', '/api/v1/auth/accounts')).status).toBe(
      403,
    );
    expect(
      (await admin('DELETE', `/api/v1/auth/api-keys/${made.json.short_token}`))
        .status,
    ).toBeLessThan(300);
    expect((await callWith(k, 'GET', '/api/v1/sources')).status).toBe(401);
  });
});
