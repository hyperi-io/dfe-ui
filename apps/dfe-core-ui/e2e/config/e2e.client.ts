import { expect } from '@playwright/test';
import { SeedRequest } from './e2e.client.types';

export const BASE_URL =
  process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

/** dfe-engine base URL (e2e helpers are not under /api/v1). */
export const ENGINE_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.INTERNAL_API_URL ||
  'http://localhost:8003';

/**
 * How long a console assertion waits for a deployment to answer.
 *
 * The 5s default is a loopback figure. Against a deployment each list is a
 * round trip out to the gateway and back through the engine, and the console
 * prefetches every sidebar route alongside the one request the page needs -- on
 * a k8s deploy the sources tree has taken 18s to render.
 */
export const UI_TIMEOUT = Number(process.env.E2E_UI_TIMEOUT || 60_000);

/**
 * Transport options the browser and every acceptance request context share.
 *
 * A docker stack answers on loopback in plain HTTP and needs neither. A real
 * deployment needs both: it terminates TLS with its own CA, and on k8s it
 * answers on a gateway address under a zone the runner's resolver may not
 * carry, so E2E_PROXY_SERVER points the run at a proxy that resolves the
 * hostname while leaving Host and SNI intact. E2E_PROXY_BYPASS keeps a
 * directly reachable address (the receiver's own LB) off the proxy.
 */
export const transportOptions = (): {
  ignoreHTTPSErrors: boolean;
  proxy?: { server: string; bypass?: string };
} => ({
  ignoreHTTPSErrors: process.env.E2E_IGNORE_HTTPS_ERRORS === '1',
  ...(process.env.E2E_PROXY_SERVER
    ? {
        proxy: {
          server: process.env.E2E_PROXY_SERVER,
          bypass: process.env.E2E_PROXY_BYPASS,
        },
      }
    : {}),
});

export const e2eClient = async ({
  playwright,
  requestType = 'post',
  seedScript,
}: {
  playwright: typeof import('playwright-core');
  requestType?: 'post';
  seedScript?: SeedRequest['script'];
}) => {
  const apiContext = await playwright.request.newContext({
    baseURL: ENGINE_API_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  });

  const response = await apiContext[requestType]('/api/e2e/seed-static', {
    data: {
      script: seedScript,
    },
  });

  expect(response.ok()).toBeTruthy();
  const responseBody = await response.json();
  expect(responseBody.success).toBeTruthy();

  await apiContext.dispose();
};
