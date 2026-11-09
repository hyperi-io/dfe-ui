import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';
import { prepareJourneyStack } from '@e2e/config/journey.helpers';

import { adminApi, call } from './settings.helpers';

prepareJourneyStack();

test.describe(
  'jset: setup status and organisations',
  { tag: [TAGS.core, TAGS.settings] },
  () => {
    test('the anonymous status hides organisations, the authenticated API lists them', async () => {
      const anon = await call(undefined, 'GET', '/api/v1/auth/setup-status');
      expect(anon.status).toBe(200);
      expect(anon.json.initial_setup.complete).toBe(true);
      expect(anon.json.organisations).toEqual([]);
      expect((await call(undefined, 'GET', '/api/v1/orgs')).status).toBe(401);

      const admin = await adminApi();
      const orgs = await admin('GET', '/api/v1/orgs');
      expect(orgs.status).toBe(200);
      expect(orgs.json.items.map((o: { name: string }) => o.name)).toContain(
        'default',
      );
      expect(orgs.json.total_size).toBe(orgs.json.items.length);
      const fallback = await admin('GET', '/api/v1/orgs/default');
      expect(fallback.status).toBe(200);
      expect(fallback.json.enabled).toBe(true);
    });
  },
);
