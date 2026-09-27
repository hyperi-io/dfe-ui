import { Page, expect } from '@playwright/test';
import type { components } from '@repo/dfe-engine-types';
import { BASE_URL } from './e2e.client';

export type AutoMergeStatus = components['schemas']['AutoMergeStatus'];

/**
 * Open the Git Operations tab, returning the auto-merge status the page was served.
 *
 * The toggle reads a default until that request returns, so an assertion made
 * on the label before then passes or fails on timing alone.
 */
export const openGitOpsTab = async (page: Page) => {
  const autoMerge = page.waitForResponse(
    (response) =>
      response.request().method() === 'GET' &&
      new URL(response.url()).pathname === '/api/v1/gitops/auto-merge',
  );
  await page.getByRole('tab', { name: 'Git Operations' }).click();
  await expect(page).toHaveURL(`${BASE_URL}/platform/gitops`);
  return (await (await autoMerge).json()) as AutoMergeStatus;
};

/**
 * The toggle offers what the engine will accept: enabling needs the deployment
 * gate, disabling never does.
 */
export const expectAutoMergeToggle = async (
  page: Page,
  status: AutoMergeStatus,
) => {
  // The page has rendered the answer, not the defaults, once Stored shows it.
  await expect(page.locator('dt:text-is("Stored") + dd')).toHaveText(
    status.stored ? 'Yes' : 'No',
  );
  const toggle = page.getByRole('button', {
    name: status.stored ? 'Disable Auto Merge' : 'Enable Auto Merge',
    exact: true,
  });
  if (status.stored || status.allowed) {
    await expect(toggle).toBeEnabled();
  } else {
    await expect(toggle).toBeDisabled();
  }
};
