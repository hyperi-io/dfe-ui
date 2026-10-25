import { Page, expect } from '@playwright/test';

/**
 * The settings menu at the foot of the sidebar: the signed-in account, Logout,
 * View Profile, and a link to each settings area the account may open.
 */
export const openSettingsMenu = async (page: Page) => {
  await page
    .getByRole('button', { name: 'Settings actions', exact: true })
    .click();
  const menu = page.getByRole('tooltip').filter({ hasText: 'Welcome,' });
  await expect(menu).toBeVisible();
  return menu;
};

/** What the menu offers an account: who it is, how to leave, and which settings it may open. */
export const expectSettingsMenu = async (
  page: Page,
  {
    user,
    platformSettings,
    adminSettings,
  }: { user: string; platformSettings: boolean; adminSettings: boolean },
) => {
  const menu = await openSettingsMenu(page);

  await expect(menu).toContainText('Welcome,');
  await expect(menu.getByText(user, { exact: true })).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Logout' })).toBeVisible();
  await expect(
    menu.getByRole('button', { name: 'View Profile' }),
  ).toBeVisible();

  const platform = menu.getByRole('link', { name: 'Platform Settings' });
  const admin = menu.getByRole('link', { name: 'Admin Settings' });
  await (platformSettings
    ? expect(platform).toBeVisible()
    : expect(platform).toHaveCount(0));
  await (adminSettings
    ? expect(admin).toBeVisible()
    : expect(admin).toHaveCount(0));
};

export const logOut = async (page: Page) => {
  const menu = await openSettingsMenu(page);
  await menu.getByRole('button', { name: 'Logout' }).click();
};
