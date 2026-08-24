import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import { loginAs } from '../../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_analyst_user' });
  await loginAs(page, 'dfe_analyst');
});

test('Sidebar Navigation', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(`${BASE_URL}/sources`);

  /* Shows the correct sidebar navigation links */
  await expect(
    page.getByRole('link', { name: 'Sources', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Meta Schemas', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Rules', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Hunts', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Settings', exact: true }),
  ).toBeVisible();

  /* Does not show other sidebar navigation links */
  await expect(
    page.getByRole('link', { name: 'Search', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Saved Searches', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Chart Explorer', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Dashboards', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Services', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Platform', exact: true }),
  ).toBeHidden();
});

test('User actions', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(`${BASE_URL}/sources`);

  await page.getByRole('button', { name: 'User actions', exact: true }).click();
  await expect(page.getByText('User ID:')).toBeVisible();
  await expect(page.getByText('dfe_analyst')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Logout', exact: true }),
  ).toBeVisible();
});

test('Logout', async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page).toHaveURL(`${BASE_URL}/sources`);

  await page.getByRole('button', { name: 'User actions', exact: true }).click();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/login?callbackUrl=%2Fsources`);
});

test('Sources', async ({ page }) => {
  await page.goto(`${BASE_URL}/sources`);

  await expect(
    page.getByRole('link', { name: 'Sources', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'Add Source', exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText('No sources found')).toBeVisible();
  await expect(page.getByText('No source selected')).toBeVisible();
});

test('Meta Schemas', async ({ page }) => {
  await page.goto(`${BASE_URL}/schemas`);

  await expect(
    page.getByRole('link', { name: 'Meta Schemas', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('link', { name: 'Other Schemas', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Schema', exact: true }),
  ).toBeVisible();

  /* Meta Schemas */
  await expect(page.getByText('aws')).toBeVisible();
  await expect(page.getByText('azure')).toBeVisible();
  await expect(page.getByText('gcp')).toBeVisible();
  await expect(page.getByText('m365')).toBeVisible();

  /* Other Schemas */
  await page.getByRole('link', { name: 'Other Schemas', exact: true }).click();
  await expect(page.getByText('common-header')).toBeVisible();
  await expect(page.getByText('hunts')).toBeVisible();
});

test('Rules', async ({ page }) => {
  await page.goto(`${BASE_URL}/rules`);

  await expect(
    page.getByRole('link', { name: 'Rules', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'Add Rule', exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText('No rules found')).toBeVisible();
  await expect(page.getByText('No rule selected')).toBeVisible();
});

test('Hunts', async ({ page }) => {
  await page.goto(`${BASE_URL}/hunts`);

  await expect(
    page.getByRole('link', { name: 'Hunts', exact: true }),
  ).toHaveCount(2);
  await expect(
    page.getByRole('button', { name: 'Add Hunt', exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText('No hunts found')).toBeVisible();
  await expect(page.getByText('No hunt selected')).toBeVisible();
});

test('Services', async ({ page }) => {
  await page.goto(`${BASE_URL}/services`);
});

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/settings`);
  });

  test('Tabs', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/settings/admin`);

    await expect(
      page.getByRole('link', { name: 'Admin Controls', exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole('tab', { name: 'Organisation Management' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Role Management' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Group Management' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Account Management' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'OIDC Provider Management' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'API Key Management' }),
    ).toBeVisible();
  });

  test('Organisation Management', async ({ page }) => {
    await expect(
      page.getByRole('button', {
        name: 'Configure New Organisation',
        exact: true,
      }),
    ).toBeDisabled();

    await page
      .getByRole('button', { name: 'organisation actions', exact: true })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'View organisation details',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Edit organisation',
        exact: true,
      }),
    ).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Delete organisation', exact: true }),
    ).toBeDisabled();
  });
});

test('Platform', async ({ page }) => {
  await page.goto(`${BASE_URL}/platform`);
});
