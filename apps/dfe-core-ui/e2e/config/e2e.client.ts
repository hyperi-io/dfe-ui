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
  requestType = 'post',
  seedScript,
}: {
  // Callers still pass the Playwright fixture. The seed itself does not use it:
  // a traced request context closes after the seed and deletes trace files the
  // next test is still reading (ENOENT on recording*.network and *.stacks).
  playwright?: typeof import('playwright-core');
  requestType?: 'post';
  seedScript?: SeedRequest['script'];
}) => {
  const response = await fetch(
    new URL('/api/e2e/seed-static', ENGINE_API_URL),
    {
      method: requestType,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: seedScript }),
    },
  );

  expect(response.ok).toBeTruthy();
  const responseBody = (await response.json()) as { success?: boolean };
  expect(responseBody.success).toBeTruthy();
};
