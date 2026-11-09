import { expect as baseExpect, test } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, shot } from '@e2e/config/journey.helpers';
import { loginAs, textbox } from '@e2e/config/login.helpers';
import { TAGS } from '@e2e/config/tags.constants';

import { dropSource, engineClient, ensureSource } from './detection.helpers';

/**
 * A user adds a field map, finds it in the list and reads its mappings, and the
 * engine holds exactly what was typed. The console offers no delete for a field
 * map, so the spec removes it through the API.
 */
const expect = baseExpect.configure({ timeout: 20_000 });
const STANDARD = 'jdetfm';
const SOURCE = 'jdet-src';
const MAPPINGS: [string, string][] = [
  ['user.name', 'jdet_user'],
  ['event.action', 'jdet_action'],
];

test.setTimeout(90_000);
test.use({ actionTimeout: 15_000 });

test(
  'Field map: add, find, read back',
  { tag: [TAGS.core] },
  async ({ page, request }) => {
    const api = engineClient(request, await engineToken());
    const madeSource = await ensureSource(api);
    await api.del(`/field-maps/${STANDARD}/${SOURCE}`);
    await loginAs(page, JOURNEY_USER);
    await page.goto(`${BASE_URL}/field-maps`);

    await page.getByRole('button', { name: 'Add Field Map' }).first().click();
    await textbox(page, 'Standard Name').fill(STANDARD);
    await page.locator('#field-map_source').click({ force: true });
    await page
      .locator('.ant-select-item-option', { hasText: SOURCE })
      .first()
      .click();
    await page
      .getByRole('textbox', { name: 'Description' })
      .fill('JDET field map');
    await page
      .getByRole('textbox', { name: 'Standard field' })
      .first()
      .fill(MAPPINGS[0][0]);
    await page
      .getByRole('textbox', { name: 'Source field' })
      .first()
      .fill(MAPPINGS[0][1]);
    await page.getByRole('button', { name: 'Add mapping' }).click();
    await page
      .getByRole('textbox', { name: 'Standard field' })
      .last()
      .fill(MAPPINGS[1][0]);
    await page
      .getByRole('textbox', { name: 'Source field' })
      .last()
      .fill(MAPPINGS[1][1]);
    await shot(page, 'fieldmaps-filled');
    await page.getByRole('button', { name: 'Add Field Map' }).last().click();
    await expect(
      page.getByText('Field map created successfully'),
    ).toBeVisible();
    await shot(page, 'fieldmaps-created');

    // The engine holds what was typed
    const made = await (
      await api.get(`/field-maps/${STANDARD}/${SOURCE}`)
    ).json();
    expect(made.standard).toBe(STANDARD);
    expect(made.source).toBe(SOURCE);
    expect(made.description).toBe('JDET field map');
    expect(made.mappings).toEqual({
      [MAPPINGS[0][0]]: MAPPINGS[0][1],
      [MAPPINGS[1][0]]: MAPPINGS[1][1],
    });

    // The list counts it the way the API does, and the detail shows each mapping
    await page.goto(`${BASE_URL}/field-maps?search=${STANDARD}`);
    const listed = await (
      await api.get(`/field-maps?search=${STANDARD}`)
    ).json();
    await expect(
      page.getByText(
        `${listed.items.length} of ${listed.total_size} result${listed.total_size === 1 ? '' : 's'}`,
      ),
    ).toBeVisible();
    await page.getByText(STANDARD).first().click();
    for (const [std, src] of MAPPINGS) {
      await expect(page.getByText(std, { exact: true }).first()).toBeVisible();
      await expect(page.getByText(src, { exact: true }).first()).toBeVisible();
    }
    await shot(page, 'fieldmaps-detail');

    await api.del(`/field-maps/${STANDARD}/${SOURCE}`);
    expect((await api.get(`/field-maps/${STANDARD}/${SOURCE}`)).status()).toBe(
      404,
    );
    if (madeSource) await dropSource(api);
  },
);
