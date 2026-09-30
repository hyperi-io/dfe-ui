/** @vitest-environment node */

import { describe, expect, test } from 'vitest';
import { endEngineSessions } from './endEngineSessions';

const BASE = 'http://engine.test';

type TCall = {
  url: string;
  method?: string;
  auth: string | null;
  signal: boolean;
};

const engine = (answer: Response | Error) => {
  const calls: TCall[] = [];
  const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method,
      auth: new Headers(init?.headers).get('authorization'),
      signal: init?.signal instanceof AbortSignal,
    });
    if (answer instanceof Error) throw answer;
    return answer;
  };
  return { calls, fetchImpl };
};

describe('endEngineSessions', () => {
  test('asks the engine to log the token out, with a deadline', async () => {
    const { calls, fetchImpl } = engine(new Response(null, { status: 204 }));

    expect(await endEngineSessions('engine-jwt', BASE, fetchImpl)).toBe(true);
    expect(calls).toEqual([
      {
        url: `${BASE}/api/v1/auth/logout`,
        method: 'POST',
        auth: 'Bearer engine-jwt',
        signal: true,
      },
    ]);
  });

  test.each([
    ['refuses an ended session', new Response('{}', { status: 401 })],
    ['predates the logout route', new Response('{}', { status: 404 })],
    ['is unreachable or too slow', new TypeError('fetch failed')],
  ])(
    'reports false, never throws, when the engine %s',
    async (_why, answer) => {
      const { fetchImpl } = engine(answer);

      await expect(
        endEngineSessions('engine-jwt', BASE, fetchImpl),
      ).resolves.toBe(false);
    },
  );
});
