import { expect, Page, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../config/e2e.client';
import { engine, forgetEngineToken } from '../config/engineApi.helpers';
import { loginAs } from '../config/login.helpers';

/**
 * The organisation, hunt and rule surfaces against the engine's tenant fence:
 * an organisation ID a hunt still reads for another organisation, an ID the
 * engine refuses, a hunt naming a deleted organisation, and a rule preview
 * held to no organisation.
 */

const ORG = 'fenceco';
const HUNT = 'fence_hunt';
const RULE = 'fence_rule';
const ACTION = 'fence-plant-held-ids';
const HELD_ID = 'fence-held-1';

const deleteIfPresent = async (path: string) => {
  try {
    await engine('DELETE', path);
  } catch (error) {
    if (!String(error).includes('-> 404')) throw error;
  }
};

// Rules, hunts and actions outlive reset_all, so each test removes its own first.
test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_admin_user' });
  forgetEngineToken();

  await deleteIfPresent(`/api/v1/hunts/${HUNT}`);
  await deleteIfPresent(`/api/v1/rules/${RULE}`);
  await deleteIfPresent(`/api/v1/governance/admin/actions/${ACTION}`);

  await engine('POST', '/api/v1/orgs', {
    name: ORG,
    display_name: 'Fence Co',
    org_ids: [`${ORG}-1`],
  });
  await engine('POST', '/api/v1/rules', {
    name: RULE,
    severity: 'medium',
    user_sql: "SELECT * FROM dfe.main WHERE event_type = 'fence'",
    estimate_cost: false,
  });
  await engine('POST', '/api/v1/hunts', {
    name: HUNT,
    cron: '*/5 * * * *',
    log_buffer: 60,
    customers: [ORG],
    rules: [RULE],
    global_source_table_name: 'main',
  });

  await loginAs(page, 'dfe_admin');
});

/** A governance action stores an ID in the hunt that the organisation itself does not declare. */
const plantHeldId = async () => {
  await engine('POST', '/api/v1/governance/admin/actions', {
    name: ACTION,
    changes: [
      {
        cls: 'hunts',
        name: HUNT,
        path: 'customer_tenant_ids',
        value: { [ORG]: [`${ORG}-1`, HELD_ID] },
      },
    ],
  });
  await engine('POST', `/api/v1/governance/actions/${ACTION}/invoke`, {});
};

const addOrganisationId = async (page: Page, value: string) => {
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('combobox', { name: 'Organisation IDs' }).click();
  await page.keyboard.insertText(value);
  await page.keyboard.press('Enter');
};

const expectHeldNotification = async (page: Page) => {
  const drawer = page.getByRole('dialog');
  await expect(
    drawer.getByText(
      'Hunts still read these organisation IDs for another organisation',
    ),
  ).toBeVisible();
  const hunt = drawer.getByRole('link', { name: HUNT, exact: true });
  await expect(hunt).toHaveAttribute('href', `/hunts?name=${HUNT}`);
  await expect(drawer.getByRole('listitem')).toHaveText(
    `${HUNT} reads ${HELD_ID} for ${ORG}`,
  );
  await expect(
    drawer.getByText('Use other organisation IDs, or edit those hunts first.'),
  ).toBeVisible();
  await expect(drawer.getByText(/tenant id/)).toHaveCount(0);
};

test.describe('Organisation drawers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/settings/admin`);
  });

  test('Create names the hunt still reading an organisation ID', async ({
    page,
  }) => {
    await plantHeldId();
    await page
      .getByRole('button', { name: 'Configure New Organisation', exact: true })
      .click();
    const drawer = page.getByRole('dialog');
    await drawer.getByPlaceholder('Enter name').fill('newco');
    await drawer.getByPlaceholder('Enter display name').fill('New Co');
    await addOrganisationId(page, HELD_ID);
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();

    await expectHeldNotification(page);
  });

  test('Edit names the hunt still reading an organisation ID', async ({
    page,
  }) => {
    await plantHeldId();
    await page
      .getByRole('button', { name: 'organisation actions', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Edit organisation', exact: true })
      .click();
    await addOrganisationId(page, HELD_ID);
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Save', exact: true })
      .click();

    await expectHeldNotification(page);
  });

  test('Create shows a refused organisation ID on its field', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Configure New Organisation', exact: true })
      .click();
    const drawer = page.getByRole('dialog');
    await drawer.getByPlaceholder('Enter name').fill('tabco');
    await drawer.getByPlaceholder('Enter display name').fill('Tab Co');
    await addOrganisationId(page, 'tab\tco');
    await drawer.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(
      drawer.getByText(
        'Organisation ID "tab\\tco" may not be blank, hold a comma or a control character such as a tab, or start or end with a space',
      ),
    ).toBeVisible();
    await expect(drawer.getByText(/validation error/)).toHaveCount(0);
    await expect(drawer.getByText(/should match pattern/)).toHaveCount(0);
  });
});

test('A hunt naming a deleted organisation is refused on its organisations', async ({
  page,
}) => {
  await engine('DELETE', `/api/v1/orgs/${ORG}`);
  await page.goto(`${BASE_URL}/hunts?name=${HUNT}`);
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Hunt', exact: true }).click();
  const drawer = page.getByRole('dialog');

  const update = page.waitForRequest(
    (request) =>
      request.method() === 'PUT' &&
      request.url().endsWith(`/api/v1/hunts/${HUNT}`),
  );
  await drawer.getByRole('button', { name: 'Edit Hunt', exact: true }).click();

  expect((await update).postDataJSON()).not.toHaveProperty('customer_filters');
  await expect(drawer.getByText(`Not a registered org: '${ORG}'`)).toHaveCount(
    1,
  );
  await expect(drawer.locator('.ant-form-item-has-error')).toContainText(
    'Organisations',
  );
});

test('A rule its hunt holds to no organisation is unmeasured', async ({
  page,
}) => {
  await engine('DELETE', `/api/v1/orgs/${ORG}`);
  await page.goto(`${BASE_URL}/rules?name=${RULE}`);
  await page.getByRole('button', { name: 'Actions', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Rule', exact: true }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Update Rule', exact: true })
    .click();

  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByText(
      "The alert-volume preview could not finish: it may count no org's rows for this rule. This rule's alert volume is unknown until it runs.",
    ),
  ).toBeVisible();
});
