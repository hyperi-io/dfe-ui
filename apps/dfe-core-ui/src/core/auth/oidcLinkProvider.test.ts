import { authorizeLink } from '@/core/auth/oidcLinkProvider';
import { describe, expect, test } from 'vitest';

const BASE = 'http://engine.test';
const TOKEN = 'header.eyJzdWIiOiJrYXoifQ.sig';

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

type TSeen = { body?: string; headers?: Headers; urls: string[] };

// Answers the link route with *link* and /auth/me as kaz.
const engine =
  (link: Response, seen: TSeen) =>
  async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    seen.urls.push(url);
    if (url.endsWith('/api/v1/auth/oidc/link')) {
      seen.body = String(init?.body);
      seen.headers = new Headers(init?.headers);
      return link;
    }
    return jsonResponse(200, { user_id: 'kaz', roles: ['data_viewer'] });
  };

describe('authorizeLink', () => {
  test('redeems the ticket with the password and signs in as the account', async () => {
    const seen: TSeen = { urls: [] };
    const user = await authorizeLink(
      'ticket-1',
      'pw',
      BASE,
      { 'X-Forwarded-For': '203.0.113.7' },
      engine(jsonResponse(200, { access_token: TOKEN }), seen),
    );

    expect(JSON.parse(seen.body ?? '{}')).toEqual({
      password: 'pw',
      ticket: 'ticket-1',
    });
    expect(seen.headers?.get('x-forwarded-for')).toBe('203.0.113.7');
    expect(seen.urls).toEqual([
      `${BASE}/api/v1/auth/oidc/link`,
      `${BASE}/api/v1/auth/me`,
    ]);
    expect(user).toMatchObject({
      id: 'kaz',
      accessToken: TOKEN,
      roles: ['data_viewer'],
    });
  });

  test.each([
    [401, { code: 'unauthorized' }, 'unauthorized'],
    [401, { code: 'link_ticket_invalid' }, 'link_ticket_invalid'],
    [429, { code: 'too_many_attempts' }, 'too_many_attempts'],
    [503, 'not json', 'unauthorized'],
  ])('a %i refusal throws its code', async (status, body, code) => {
    const seen: TSeen = { urls: [] };
    await expect(
      authorizeLink(
        'ticket-1',
        'pw',
        BASE,
        {},
        engine(jsonResponse(status, body), seen),
      ),
    ).rejects.toThrow(code);
    expect(seen.urls).toEqual([`${BASE}/api/v1/auth/oidc/link`]);
  });

  test.each([
    ['', 'pw'],
    ['ticket-1', ''],
  ])(
    'asks nothing without a ticket and a password',
    async (ticket, password) => {
      const seen: TSeen = { urls: [] };
      const user = await authorizeLink(
        ticket,
        password,
        BASE,
        {},
        engine(jsonResponse(200, {}), seen),
      );
      expect([user, seen.urls]).toEqual([null, []]);
    },
  );
});
