import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';
import { prepareJourneyStack } from '@e2e/config/journey.helpers';

import { adminApi, call, stamp, tokenFor } from './settings.helpers';

prepareJourneyStack();

test.describe('jset: live tokens', { tag: [TAGS.core, TAGS.settings] }, () => {
  test('blocking or deactivating an account ends a token it already holds', async () => {
    const admin = await adminApi();
    const user = `jset-live-${stamp()}`;
    const pw = 'jset-Live-pass-123';
    expect(
      (
        await admin('POST', '/api/v1/auth/accounts', {
          username: user,
          password: pw,
          email: `${user}@example.com`,
          groups: ['dfe-viewers'],
        })
      ).status,
    ).toBe(201);
    const token = await tokenFor(user, pw);
    expect((await call(token, 'GET', '/api/v1/auth/me')).status).toBe(200);

    expect(
      (await admin('PUT', `/api/v1/auth/accounts/${user}`, { blocked: true }))
        .status,
    ).toBe(200);
    const afterBlock = await call(token, 'GET', '/api/v1/auth/me');
    await admin('PUT', `/api/v1/auth/accounts/${user}`, { blocked: false });

    expect(
      (await admin('PUT', `/api/v1/auth/accounts/${user}`, { enabled: false }))
        .status,
    ).toBe(200);
    const afterDeactivate = await call(token, 'GET', '/api/v1/auth/me');

    await admin('DELETE', `/api/v1/auth/accounts/${user}`);
    const afterDelete = await call(token, 'GET', '/api/v1/auth/me');

    expect(
      afterBlock.status,
      'blocked account keeps a working token',
    ).toBeGreaterThanOrEqual(401);
    expect(
      afterDeactivate.status,
      'deactivated account keeps a working token',
    ).toBeGreaterThanOrEqual(401);
    expect(
      afterDelete.status,
      'deleted account keeps a working token',
    ).toBeGreaterThanOrEqual(401);
  });
});
