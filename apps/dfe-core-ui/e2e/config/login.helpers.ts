import { BREAK_GLASS_ADMIN_PASSWORD } from '@/core/components/SetupWizard/constants';
import { Page } from '@playwright/test';
import { BASE_URL } from './e2e.client';

export const loginAs = async (page: Page, user: string) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByRole('textbox', { name: 'Username', exact: true }).fill(user);
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(BREAK_GLASS_ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};
