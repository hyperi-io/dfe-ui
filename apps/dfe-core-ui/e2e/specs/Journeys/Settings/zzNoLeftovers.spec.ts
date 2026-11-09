import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';
import { prepareJourneyStack } from '@e2e/config/journey.helpers';

import { adminApi } from './settings.helpers';

prepareJourneyStack();

// Runs after the other settings journeys (the zz prefix). Each names what it
// creates jset-... and deletes it again.
const KINDS = [
  { path: '/api/v1/auth/accounts', key: 'username' },
  { path: '/api/v1/auth/groups', key: 'name' },
  { path: '/api/v1/auth/roles', key: 'name' },
  { path: '/api/v1/orgs', key: 'name' },
  { path: '/api/v1/auth/oidc-providers', key: 'name' },
  { path: '/api/v1/auth/api-keys', key: 'name' },
];

test(
  'jset: the journeys leave no jset- data behind',
  { tag: [TAGS.core, TAGS.settings] },
  async () => {
    const admin = await adminApi();
    const left: string[] = [];
    for (const k of KINDS) {
      const r = await admin('GET', `${k.path}?page_size=500`);
      for (const it of r.json.items.filter((i: Record<string, string>) =>
        String(i[k.key]).startsWith('jset'),
      )) {
        left.push(`${k.path}/${it[k.key]}`);
      }
    }
    expect(left).toEqual([]);
  },
);
