import { expect } from '@playwright/test';
import { ENGINE_API_URL } from './e2e.client';
import { SeedRequest } from './e2e.client.types';

/**
 * Run an app-management seed, failing with the likely cause.
 *
 * Same route as `e2eClient`, but these three seeds write to the deploy repo and
 * answer 500 on an engine without DFE_GITOPS_ENABLED=true. That is the one
 * failure worth naming, because the response body says only "internal_error".
 */
export const seedAppManagement = async ({
  playwright,
  seedScript,
}: {
  playwright: typeof import('playwright-core');
  seedScript: SeedRequest['script'];
}) => {
  const apiContext = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  const response = await apiContext.post('/api/e2e/seed-static', {
    data: { script: seedScript },
  });

  expect(
    response.ok(),
    `Seed ${seedScript} failed (${response.status()}). It writes to the deploy repo, so the engine needs DFE_GITOPS_ENABLED=true.`,
  ).toBeTruthy();
  expect((await response.json()).success).toBeTruthy();

  await apiContext.dispose();
};
