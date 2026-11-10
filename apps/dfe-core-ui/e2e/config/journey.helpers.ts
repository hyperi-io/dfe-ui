/* eslint-disable @typescript-eslint/no-explicit-any -- the engine replies are read as loose JSON */
import { mkdirSync } from 'node:fs';

import { Page, test } from '@playwright/test';

import { ENGINE_API_URL, e2eClient } from './e2e.client';
import { engineToken, forgetEngineToken } from './engineApi.helpers';

/** The seeded account the journeys sign in as, in the console and against the engine. */
export const JOURNEY_USER = 'initial_user';

/** Screenshots are written only when JOURNEY_SHOTS_DIR names a directory. */
export const shot = async (page: Page, name: string, fullPage = true) => {
  const dir = process.env.JOURNEY_SHOTS_DIR;
  if (!dir) return;
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${name}.png`, fullPage });
};

export type Reply<T = any> = { status: number; json: T };

/**
 * One engine call that returns the status as well as the body, so a journey can
 * assert a refusal. `token` undefined is an anonymous call. `engine()` in
 * engineApi.helpers throws on any non-2xx and cannot do that.
 */
export const call = async <T = any>(
  token: string | undefined,
  method: string,
  path: string,
  body?: unknown,
  headers: Record<string, string> = {},
): Promise<Reply<T>> => {
  const response = await fetch(`${ENGINE_API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json: any = text;
  try {
    json = JSON.parse(text);
  } catch {
    /* a non-JSON body stays text */
  }
  return { status: response.status, json };
};

/** `call` as the journey account. */
export const callAsJourneyUser = async <T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<Reply<T>> => call<T>(await engineToken(), method, path, body);

/**
 * Register the setup every journey file needs, as its first hook.
 *
 * The journeys never reset the stack, but the specs that run before them do. So
 * the token a spec held across its reset is dropped, and a stack left short of
 * setup by the specs before them is taken through `seed_setup_complete`.
 */
export const prepareJourneyStack = () =>
  test.beforeAll(async ({ playwright }) => {
    forgetEngineToken();
    const status = await call(undefined, 'GET', '/api/v1/auth/setup-status');
    if (!status.json?.initial_setup?.complete) {
      await e2eClient({ playwright, seedScript: 'seed_setup_complete' });
    }
  });
