import { expect } from '@playwright/test';
import { SeedRequest } from './e2e.client.types';

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
    baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8003'}`,
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
