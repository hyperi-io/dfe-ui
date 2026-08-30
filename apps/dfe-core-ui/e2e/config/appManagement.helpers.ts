import { ENGINE_API_URL } from './e2e.client';
import { SeedRequest } from './e2e.client.types';

/**
 * Run an app-management seed, reporting whether the engine could.
 *
 * The three app-management seeds write to the deploy repo, so they need
 * DFE_GITOPS_ENABLED=true and answer 500 without it. This returns the outcome
 * instead of asserting it, so a spec can skip with the reason rather than fail
 * on a stack that is not configured for it.
 */
export const trySeed = async ({
  playwright,
  seedScript,
}: {
  playwright: typeof import('playwright-core');
  seedScript: SeedRequest['script'];
}): Promise<boolean> => {
  const apiContext = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    extraHTTPHeaders: { 'Content-Type': 'application/json' },
  });

  const response = await apiContext.post('/api/e2e/seed-static', {
    data: { script: seedScript },
  });
  const ok = response.ok();

  await apiContext.dispose();
  return ok;
};

export const GITOPS_REQUIRED =
  'Needs an engine with DFE_GITOPS_ENABLED=true: the app-management seeds write to the deploy repo.';
