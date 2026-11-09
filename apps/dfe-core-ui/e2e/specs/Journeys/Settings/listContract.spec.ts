import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';
import { prepareJourneyStack } from '@e2e/config/journey.helpers';

import { adminApi } from './settings.helpers';

prepareJourneyStack();

const LISTS = [
  '/api/v1/orgs',
  '/api/v1/auth/accounts',
  '/api/v1/auth/groups',
  '/api/v1/auth/roles',
  '/api/v1/auth/roles/scopes',
  '/api/v1/auth/api-keys',
  '/api/v1/auth/oidc-providers',
];

test.describe(
  'jset: settings list contract',
  { tag: [TAGS.core, TAGS.settings] },
  () => {
    test('every settings list answers {items, next_page_token, total_size}, and one-item pages chain to the total', async () => {
      const admin = await adminApi();
      for (const path of LISTS) {
        const all = await admin('GET', `${path}?page_size=500`);
        expect(all.status, path).toBe(200);
        expect(Object.keys(all.json), path).toEqual(
          expect.arrayContaining(['items', 'next_page_token', 'total_size']),
        );
        expect(all.json.total_size, path).toBe(all.json.items.length);
        let seen = 0;
        let token: string | null = null;
        do {
          const q: string = `${path}?page_size=1${token ? `&page_token=${encodeURIComponent(token)}` : ''}`;
          const page = await admin('GET', q);
          expect(page.status, q).toBe(200);
          seen += page.json.items.length;
          token = page.json.next_page_token;
        } while (token);
        expect(seen, `${path} walked one at a time`).toBe(all.json.total_size);
      }
    });
  },
);
