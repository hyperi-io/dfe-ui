import { expect, test } from '@playwright/test';

import { TAGS } from '@e2e/config/tags.constants';
import { prepareJourneyStack } from '@e2e/config/journey.helpers';

import {
  ADMIN,
  adminApi,
  adminPage,
  call,
  choose,
  chooseMany,
  formLogin,
  letClicksThrough,
  shot,
  stamp,
  tokenFor,
} from './settings.helpers';

prepareJourneyStack();

test.setTimeout(240_000);
const PASSWORD = 'jset-Access-pass-1';
const SCOPES = ['source:read', 'dashboard:read', 'query:execute', 'org:read'];

test.describe(
  'jset: roles, groups and what a limited user can do',
  { tag: [TAGS.core, TAGS.settings, TAGS.roles] },
  () => {
    test('a limited role and group, a user in it: pages and API both refuse what the role lacks', async ({
      page,
      browser,
    }) => {
      const s = stamp();
      const role = `jset-role-${s}`,
        group = `jset-grp-${s}`,
        user = `jset-ltd-${s}`;
      const admin = await adminApi();
      await adminPage(page);

      await page.goto(`${ADMIN}/role-management`);
      await page
        .getByRole('button', { name: 'Configure New Custom Role', exact: true })
        .click();
      const rd = page.getByRole('dialog', { name: 'Create Custom Role' });
      await rd.getByPlaceholder('Enter name').fill(role);
      await rd.getByPlaceholder('Enter description').fill('jset limited');
      await chooseMany(page, rd, 'Select scopes', SCOPES);
      await shot(page, 'role-create-scopes');
      await rd
        .getByRole('button', { name: 'Create Role', exact: true })
        .click();
      await expect(page.getByText('Role created successfully')).toBeVisible();
      const r = await admin('GET', `/api/v1/auth/roles/${role}`);
      expect(r.json.permissions.sort()).toEqual([...SCOPES].sort());
      expect(r.json.resource_type).not.toBe('core');

      await page.goto(`${ADMIN}/group-management`);
      await page
        .getByRole('button', { name: 'Configure New Group', exact: true })
        .click();
      const gd = page.getByRole('dialog', { name: 'Create Group' });
      await gd.getByPlaceholder('Enter name').fill(group);
      await gd.getByPlaceholder('Enter description').fill('jset group');
      await choose(page, gd, 'Select roles', role);
      await gd
        .getByRole('button', { name: 'Create Group', exact: true })
        .click();
      await expect(page.getByText('Group created successfully')).toBeVisible();
      expect(
        (await admin('GET', `/api/v1/auth/groups/${group}`)).json.roles,
      ).toEqual([role]);

      await page.goto(`${ADMIN}/account-management`);
      await page
        .getByRole('button', { name: 'Invite New User', exact: true })
        .click();
      const ad = page.getByRole('dialog', { name: 'Create Account' });
      await ad.getByPlaceholder('Enter username').fill(user);
      await ad.getByPlaceholder('Enter email').fill(`${user}@example.com`);
      await ad.getByPlaceholder('Enter password').fill(PASSWORD);
      await choose(page, ad, 'Select groups', group);
      await ad
        .getByRole('button', { name: 'Create Account', exact: true })
        .click();
      await expect(
        page.getByText('Account created successfully'),
      ).toBeVisible();
      expect(
        (await admin('GET', `/api/v1/auth/accounts/${user}`)).json.groups,
      ).toEqual([group]);
      expect(
        (await admin('GET', `/api/v1/auth/groups/${group}`)).json.members,
      ).toContain(user);

      const token = await tokenFor(user, PASSWORD);
      const me = await call(token, 'GET', '/api/v1/auth/me');
      expect(me.json.permissions.sort()).toEqual([...SCOPES].sort());
      const deny = [
        ['GET', '/api/v1/auth/accounts'],
        ['GET', '/api/v1/auth/roles'],
        ['GET', '/api/v1/auth/api-keys'],
        ['POST', '/api/v1/orgs', { name: `jset-nope-${s}` }],
        ['POST', '/api/v1/auth/groups', { name: 'x', roles: [] }],
      ] as const;
      for (const [m, p, b] of deny) {
        const res = await call(token, m, p, b);
        expect([401, 403], `${m} ${p}`).toContain(res.status);
      }
      expect((await call(token, 'GET', '/api/v1/sources')).status).toBe(200);
      expect(
        (
          await call(token, 'POST', '/api/v1/sources', {
            name: `jset-nosrc-${s}`,
          })
        ).status,
      ).toBe(403);
      expect((await admin('GET', `/api/v1/orgs/jset-nope-${s}`)).status).toBe(
        404,
      );

      const ctx = await browser.newContext();
      const lp = await ctx.newPage();
      await letClicksThrough(lp);
      await formLogin(lp, user, PASSWORD);
      await lp.waitForURL((u) => u.pathname !== '/login', { timeout: 30_000 });
      await lp.waitForTimeout(2500);
      await shot(lp, 'limited-landing');
      for (const p of [
        '/settings/admin',
        '/settings/admin/account-management',
        '/settings/admin/role-management',
      ]) {
        await lp.goto(`${ADMIN.replace('/settings/admin', '')}${p}`);
        await lp.waitForTimeout(2500);
        await shot(lp, `limited${p.replace(/\//g, '-')}`);
      }
      await ctx.close();

      await admin('DELETE', `/api/v1/auth/accounts/${user}`);
      await admin('DELETE', `/api/v1/auth/groups/${group}`);
      await admin('DELETE', `/api/v1/auth/roles/${role}`);
    });
  },
);
