import { expect } from '@playwright/test';
import { ENGINE_API_URL } from './e2e.client';
import { SeedRequest } from './e2e.client.types';

/**
 * Run an app-management seed, failing with what the engine actually answered.
 *
 * Same route as `e2eClient`, but these seeds write to the deploy repo and reach
 * the source registry, so they fail for more than one reason. The endpoint
 * turns every one of them into a bare 500 "internal_error" (dfe-engine#452), so
 * the status and the raw body go into the message and the reason itself is one
 * `docker logs` away. Do not guess a cause here again: the guess that used to
 * live on this line named DFE_GITOPS_ENABLED and cost a session.
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

  const body = await response.text();
  expect(
    response.ok(),
    `Seed ${seedScript} failed (${response.status()}): ${body}. The engine log carries the traceback the body drops.`,
  ).toBeTruthy();
  expect(JSON.parse(body).success).toBeTruthy();

  await apiContext.dispose();
};
