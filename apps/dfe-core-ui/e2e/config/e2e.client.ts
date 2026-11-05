import { expect } from '@playwright/test';
import { SeedRequest } from './e2e.client.types';

export const BASE_URL =
  process.env.BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

/** dfe-engine base URL (e2e helpers are not under /api/v1). */
export const ENGINE_API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.INTERNAL_API_URL ||
  'http://localhost:8003';

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

  // A passed test removes its trace while the next test is still closing this
  // context, so the network log can already be gone. The seed was checked above.
  try {
    await apiContext.dispose();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes('ENOENT')) {
      throw error;
    }
  }
};
