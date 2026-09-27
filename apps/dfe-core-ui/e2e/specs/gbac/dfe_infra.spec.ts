import { expect, test } from '@playwright/test';

import { BASE_URL, e2eClient } from '../../config/e2e.client';
import {
  expectAutoMergeToggle,
  openGitOpsTab,
} from '../../config/gitops.helpers';
import {
  expectLoggedOut,
  expectSourcesLanding,
  loginAs,
} from '../../config/login.helpers';

test.beforeEach(async ({ playwright, page }) => {
  await e2eClient({ playwright, seedScript: 'reset_all' });
  await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
  await e2eClient({ playwright, seedScript: 'seed_dfe_infra_user' });
  await loginAs(page, 'dfe_infra');
});

test('Sidebar Navigation', async ({ page }) => {
  await page.goto(BASE_URL);
  await expectSourcesLanding(page);

  // First landing page is Sources
  // Even if user does not see the nav link they will see the page title link
  await expect(
    page.getByRole('link', { name: 'Sources', exact: true }),
  ).toBeVisible();

  /* Shows the correct sidebar navigation links */
  await expect(
    page.getByRole('link', { name: 'Components', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Library', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Services', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Settings', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Platform', exact: true }),
  ).toBeVisible();

  /* Does not show other sidebar navigation links */
  await expect(
    page.getByRole('link', { name: 'Hunt Results', exact: true }),
  ).toBeHidden();
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
    page.getByRole('link', { name: 'Meta Schemas', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Rules', exact: true }),
  ).toBeHidden();
  await expect(
    page.getByRole('link', { name: 'Hunts', exact: true }),
  ).toBeHidden();
});

test('User actions', async ({ page }) => {
  await page.goto(BASE_URL);
  await expectSourcesLanding(page);

  await page.getByRole('button', { name: 'User actions', exact: true }).click();
  await expect(page.getByText('User ID:')).toBeVisible();
  /* Name also shows the username, so scope to the dd next to User ID */
  await expect(page.locator('dt:text-is("User ID:") + dd')).toHaveText(
    'dfe_infra',
  );
  await expect(
    page.getByRole('button', { name: 'Logout', exact: true }),
  ).toBeVisible();
});

test('Logout', async ({ page }) => {
  await page.goto(BASE_URL);
  await expectSourcesLanding(page);

  await page.getByRole('button', { name: 'User actions', exact: true }).click();
  await page.getByRole('button', { name: 'Logout', exact: true }).click();
  await expectLoggedOut(page);
});

test('Sources', async ({ page }) => {
  await page.goto(`${BASE_URL}/sources`);

  await expect(
    page.getByRole('link', { name: 'Sources', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
});

test('Meta Schemas', async ({ page }) => {
  await page.goto(`${BASE_URL}/schemas`);

  await expect(
    page.getByRole('link', { name: 'Meta Schemas', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Other Schemas', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Schema', exact: true }),
  ).toBeDisabled();

  /* Meta Schemas */
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();

  /* Other Schemas */
  await page.getByRole('link', { name: 'Other Schemas', exact: true }).click();
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
});

test('Rules', async ({ page }) => {
  await page.goto(`${BASE_URL}/rules`);

  await expect(
    page.getByRole('link', { name: 'Rules', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Rule', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
});

test('Hunts', async ({ page }) => {
  await page.goto(`${BASE_URL}/hunts`);

  await expect(
    page.getByRole('link', { name: 'Hunts', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Add Hunt', exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
});

test('Services', async ({ page }) => {
  await page.goto(`${BASE_URL}/services`);

  await expect(
    page.getByRole('link', { name: 'Service Configurations', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Seed Service Configs', exact: true }),
  ).toBeDisabled();

  await page.getByRole('link', { name: 'Deployments', exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/services/deployments`);
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeHidden();
  await expect(
    page.getByText('No deployments match your filters'),
  ).toBeVisible();
  await expect(page.getByText('No deployment selected')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Seed Deployments', exact: true }),
  ).toBeEnabled();

  await page.getByRole('link', { name: 'Surfaces', exact: true }).click();
  await expect(page).toHaveURL(`${BASE_URL}/services/surfaces`);
  await expect(
    page.getByText('You do not have sufficient permissions'),
  ).toBeVisible();
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
    ).toBeVisible();

    await page
      .getByRole('button', { name: 'organisation actions', exact: true })
      .click();
    await expect(
      page.getByRole('button', {
        name: 'View organisation details',
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      page.getByRole('button', {
        name: 'Edit organisation',
        exact: true,
      }),
    ).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Delete organisation', exact: true }),
    ).toBeDisabled();
  });

  test('Role Management', async ({ page }) => {
    await page.getByRole('tab', { name: 'Role Management' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/settings/admin/role-management`);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toHaveCount(2);
    await expect(
      page.getByRole('button', {
        name: 'Configure New Custom Role',
        exact: true,
      }),
    ).toBeDisabled();
  });

  test('Group Management', async ({ page }) => {
    await page.getByRole('tab', { name: 'Group Management' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/settings/admin/group-management`);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeHidden();
    await expect(
      page.getByRole('button', {
        name: 'Configure New Group',
        exact: true,
      }),
    ).toBeEnabled();
  });

  test('Account Management', async ({ page }) => {
    await page.getByRole('tab', { name: 'Account Management' }).click();
    await expect(page).toHaveURL(
      `${BASE_URL}/settings/admin/account-management`,
    );

    /* Two cards read account_read: Manage existing accounts, Blocked accounts */
    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toHaveCount(2);
    await expect(
      page.getByRole('button', {
        name: 'Invite New User',
        exact: true,
      }),
    ).toBeDisabled();
  });

  test('OIDC Provider Management', async ({ page }) => {
    await page.getByRole('tab', { name: 'OIDC Provider Management' }).click();
    await expect(page).toHaveURL(
      `${BASE_URL}/settings/admin/oidc-provider-management`,
    );

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Configure New OIDC Provider',
        exact: true,
      }),
    ).toBeDisabled();
  });

  test('API Key Management', async ({ page }) => {
    await page.getByRole('tab', { name: 'API Key Management' }).click();
    await expect(page).toHaveURL(
      `${BASE_URL}/settings/admin/api-key-management`,
    );

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', {
        name: 'Generate API Key',
        exact: true,
      }),
    ).toBeDisabled();
  });
});

test.describe('Platform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/platform`);
  });

  test('Tabs', async ({ page }) => {
    await expect(page).toHaveURL(`${BASE_URL}/platform`);

    await expect(
      page.getByRole('tab', { name: 'System Settings' }),
    ).toBeVisible();
    await expect(
      page.getByRole('tab', { name: 'Git Operations' }),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Governance' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Lifecycle' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Repository' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Helm' })).toBeVisible();
  });

  test('System Settings', async ({ page }) => {
    await page.getByRole('tab', { name: 'System Settings' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/platform`);

    /* Three cards read system_read: ClickHouse Cloud, System Settings, Retention */
    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toHaveCount(3);
  });

  test('Git Operations', async ({ page }) => {
    const autoMerge = await openGitOpsTab(page);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeHidden();
    await expectAutoMergeToggle(page, autoMerge);
  });

  test('Governance', async ({ page }) => {
    await page.getByRole('tab', { name: 'Governance' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/platform/governance`);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeHidden();
    await expect(
      page.getByRole('button', { name: 'Reconcile', exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Add Action', exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole('button', { name: 'Add Policy', exact: true }),
    ).toBeEnabled();
  });

  test('Lifecycle', async ({ page }) => {
    await page.getByRole('tab', { name: 'Lifecycle' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/platform/lifecycle`);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeVisible();
  });

  test('Helm', async ({ page }) => {
    await page.getByRole('tab', { name: 'Helm' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/platform/helm`);

    await expect(
      page.getByText('You do not have sufficient permissions'),
    ).toBeHidden();
  });
});
