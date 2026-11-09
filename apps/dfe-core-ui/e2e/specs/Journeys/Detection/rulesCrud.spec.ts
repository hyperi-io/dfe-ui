import { Page, expect as baseExpect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import {
  JOURNEY_USER,
  prepareJourneyStack,
  shot,
} from '@e2e/config/journey.helpers';
import { loginAs } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { engineClient } from './detection.helpers';

prepareJourneyStack();

/**
 * A user creates a rule, edits it, and deletes it, and the engine agrees after
 * each step. The engine has no enable/disable on a rule, so the console offers
 * none and the spec does not fake one.
 */
const RULE = 'jdet-rule-crud';
const DISPLAY = 'JDET Rule CRUD';
const SQL = "SELECT * FROM dfe.main WHERE _source = 'jdet-src'";
const SQL_EDITED =
  "SELECT * FROM dfe.main WHERE _source = 'jdet-src' AND _json.level = 'high'";

// The engine answers slowly while other sessions share the stack.
const expect = baseExpect.configure({ timeout: 20_000 });

test.setTimeout(90_000);
test.use({ actionTimeout: 15_000 });

/** The detail pane's actions sit behind an icon-only button with no accessible name. */
const openActions = (page: Page) =>
  page.locator('button:has(svg[class*="menu-2"])').first().click();

test(
  'Rule lifecycle: create, edit, delete',
  { tag: [TAGS.core] },
  async ({ page, request }) => {
    const api = engineClient(request, await engineToken());
    await api.del(`/rules/${RULE}`);
    await loginAs(page, JOURNEY_USER);

    // CREATE
    await page.goto(`${BASE_URL}/rules/create`);
    await page.getByRole('textbox', { name: /Name/ }).first().fill(RULE);
    await page.getByRole('textbox', { name: 'Display Name' }).fill(DISPLAY);
    await page.getByText('Medium', { exact: true }).click();
    await page.getByTitle('Critical').click();
    await page.locator('.ace_text-input').first().fill(SQL);
    await page.getByRole('button', { name: 'Validate' }).click();
    await expect(page.getByRole('button', { name: 'Valid' })).toBeVisible();
    await page.getByRole('button', { name: 'Save Rule' }).click();
    const created = page.getByRole('dialog', { name: /Rule created/ });
    await expect(created).toBeVisible({ timeout: 30_000 });
    await shot(page, 'rules-created-modal');
    await expect(created.getByText(RULE, { exact: true })).toBeVisible();

    const made = await (await api.get(`/rules/${RULE}`)).json();
    expect(made.name).toBe(RULE);
    expect(made.display_name).toBe(DISPLAY);
    expect(made.severity).toBe('critical');
    expect(made.original_sql).toContain("_source = 'jdet-src'");
    expect(made.source_table).toBe('main');

    // The list finds it
    await created.getByRole('button', { name: /Close/ }).first().click();
    await page.goto(`${BASE_URL}/rules?search=${RULE}`);
    await expect(page.getByText('1 of 1 result')).toBeVisible();
    await page.getByText(DISPLAY, { exact: true }).click();
    await shot(page, 'rules-detail');

    // EDIT
    await openActions(page);
    await shot(page, 'rules-actions-menu');
    await page.getByRole('button', { name: 'Edit Rule' }).click();
    const drawer = page;
    await page.waitForTimeout(2500);
    await shot(page, 'rules-edit-drawer');
    await expect(
      drawer.getByRole('button', { name: 'Update Rule' }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, 'rules-edit-drawer');
    await page.getByTitle('Critical').click();
    await page.getByTitle('High').click();
    await drawer.locator('.ace_text-input').last().press('Control+a');
    await drawer.locator('.ace_text-input').last().fill(SQL_EDITED);
    await drawer.getByRole('button', { name: 'Update Rule' }).click();
    await expect(page.locator('.ant-notification')).toContainText(
      'Rule JDET Rule CRUD updated',
    );
    await shot(page, 'rules-edit-saved');

    await expect
      .poll(
        async () => (await (await api.get(`/rules/${RULE}`)).json()).severity,
      )
      .toBe('high');
    const edited = await (await api.get(`/rules/${RULE}`)).json();
    expect(edited.original_sql).toContain("_json.level = 'high'");

    // DELETE
    await page.goto(`${BASE_URL}/rules?search=${RULE}`);
    await page.getByText(DISPLAY, { exact: true }).click();
    await openActions(page);
    await page.getByRole('button', { name: 'Delete Rule' }).click();
    await shot(page, 'rules-delete-confirm');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Delete', exact: true })
      .click();
    await expect
      .poll(async () => (await api.get(`/rules/${RULE}`)).status())
      .toBe(404);
    const list = await (await api.get(`/rules?search=${RULE}`)).json();
    expect(list.total_size).toBe(0);
    await shot(page, 'rules-deleted');
  },
);
