import { Browser, Locator, Page, expect } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, Reply, call, shot } from '@e2e/config/journey.helpers';
import { adminPassword, loginAs, textbox } from '@e2e/config/login.helpers';

export { call, shot };
export type { Reply };

export const ADMIN = `${BASE_URL}/settings/admin`;
export const stamp = () => Date.now().toString().slice(-6);

export const loginToken = async (username: string, password: string) => {
  const r = await call(undefined, 'POST', '/api/v1/auth/login', {
    username,
    password,
  });
  return { status: r.status, body: r.json };
};

export const tokenFor = async (
  username: string,
  password: string,
): Promise<string> => {
  const { status, body } = await loginToken(username, password);
  expect(status, `login ${username}: ${JSON.stringify(body)}`).toBe(200);
  return (body as { access_token: string }).access_token;
};

export type Caller = (
  method: string,
  path: string,
  body?: unknown,
) => Promise<Reply>;

// Each collection whose writes need a re-auth grant, the kind it names and the body field a create names it by.
const GATED = [
  { field: 'username', kind: 'account', prefix: '/api/v1/auth/accounts' },
  { field: 'name', kind: 'api_key', prefix: '/api/v1/auth/api-keys' },
  { field: 'name', kind: 'group', prefix: '/api/v1/auth/groups' },
  { field: 'name', kind: 'provider', prefix: '/api/v1/auth/oidc-providers' },
  { field: 'name', kind: 'role', prefix: '/api/v1/auth/roles' },
] as const;

// Routes under accounts that change the caller's own account, which needs no grant.
const OWN_ACCOUNT = ['me', 'reset-password'];

/** The kind and target a write to *path* needs a re-auth grant for, or undefined when it needs none. */
const grantFor = (method: string, path: string, body: unknown) => {
  if (method === 'GET') return undefined;
  const bare = path.split('?')[0] ?? '';
  const gated = GATED.find(
    ({ prefix }) => bare === prefix || bare.startsWith(`${prefix}/`),
  );
  if (!gated) return undefined;
  const named = bare.slice(gated.prefix.length + 1).split('/')[0] ?? '';
  if (gated.kind === 'account' && OWN_ACCOUNT.includes(named)) return undefined;
  const target = named
    ? decodeURIComponent(named)
    : String(
        (body as Record<string, unknown> | undefined)?.[gated.field] ?? '',
      );
  return { kind: gated.kind, target };
};

/** Calls as *token*. With *password*, an access change first earns the re-auth grant it needs. */
export const callerFor =
  (token: string, password?: string): Caller =>
  async (method, path, body) => {
    const grant =
      password === undefined ? undefined : grantFor(method, path, body);
    if (!grant) return call(token, method, path, body);
    const earned = await call(token, 'POST', '/api/v1/auth/reauth', {
      ...grant,
      password,
    });
    expect(
      earned.status,
      `re-auth for ${grant.kind} ${grant.target}: ${JSON.stringify(earned.json)}`,
    ).toBe(200);
    return call(token, method, path, body, {
      'X-DFE-Reauth': (earned.json as { grant: string }).grant,
    });
  };

/** The engine as the journey account, through the token the other e2e helpers hold. */
export const adminApi = async (): Promise<Caller> =>
  callerFor(await engineToken(), adminPassword());

/** Sign a user in through the login form of the given page. */
export const formLogin = async (
  page: Page,
  username: string,
  password: string,
) => {
  await page.goto(`${BASE_URL}/login`);
  const localTab = page.getByRole('tab', {
    name: 'Login with Local',
    exact: true,
  });
  const user = textbox(page, 'Username or Email');
  await expect(user.or(localTab)).toBeVisible();
  if (await localTab.isVisible()) {
    await localTab.click();
  }
  await user.fill(username);
  await textbox(page, 'Password').fill(password);
  await page.getByRole('button', { name: 'Login', exact: true }).click();
};

/** Hide the Next dev indicator, which takes clicks aimed at drawer buttons. */
export const letClicksThrough = (page: Page) =>
  page.addInitScript(() => {
    const hide = () => {
      document.querySelectorAll('nextjs-portal').forEach((node) => {
        (node as HTMLElement).style.setProperty('pointer-events', 'none');
      });
    };
    hide();
    new MutationObserver(hide).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });

export const adminPage = async (page: Page) => {
  await loginAs(page, JOURNEY_USER);
};

/** Pick an option in a select named by its form label, where the placeholder says something else. */
export const chooseByLabel = async (
  page: Page,
  dialog: Locator,
  label: string,
  option: string,
) => {
  await dialog.getByRole('combobox', { name: label, exact: true }).click();
  await page.keyboard.type(option);
  await page
    .locator('.ant-select-dropdown .ant-select-item-option-content')
    .getByText(option, { exact: true })
    .click({ timeout: 5_000 });
};

export const choose = async (
  page: Page,
  dialog: Locator,
  placeholder: string,
  option: string,
) => {
  const select = dialog.locator('.ant-select').filter({ hasText: placeholder });
  await select.click();
  await page.keyboard.type(option);
  await page
    .locator('.ant-select-dropdown .ant-select-item-option-content')
    .getByText(option, { exact: true })
    .click();
};

/** A settings list section by its title, e.g. 'Manage existing accounts'. */
export const section = (page: Page, title: string) =>
  page
    .getByText(title, { exact: true })
    .locator('xpath=ancestor::div[contains(@class,"border-b")][1]');

export const rowIn = (sec: Locator, text: string) =>
  sec.getByRole('row', { name: text });

/** Open a row's User actions menu and click one entry. */
export const userAction = async (page: Page, row: Locator, action: string) => {
  await row.getByRole('button', { name: 'User actions', exact: true }).click();
  await page.getByRole('button', { name: action, exact: true }).click();
};

/** Try the login form in a brand new browser context and report where the user ends up. */
export const tryUiLogin = async (
  browser: Browser,
  username: string,
  password: string,
  shotName: string,
) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await letClicksThrough(page);
  await formLogin(page, username, password);
  await page.waitForTimeout(3000);
  await shot(page, shotName);
  const errors = await page
    .locator(
      '.ant-message, .ant-notification, .ant-form-item-explain-error, [role="alert"]',
    )
    .allInnerTexts();
  const path = new URL(page.url()).pathname;
  await ctx.close();
  return { path, errors };
};

/** Pick several options in one multi-select, whose placeholder is gone after the first pick. */
export const chooseMany = async (
  page: Page,
  dialog: Locator,
  placeholder: string,
  options: string[],
) => {
  const select = dialog.locator('.ant-select').filter({ hasText: placeholder });
  const handle = await select.elementHandle();
  for (const option of options) {
    await handle!.click();
    await page.keyboard.type(option);
    await page
      .locator('.ant-select-dropdown:visible .ant-select-item-option-content')
      .getByText(option, { exact: true })
      .click();
  }
  await page.keyboard.press('Escape');
};

/** An engine call with arbitrary headers, for API keys (X-API-Key) and Bearer-with-a-key probes. */
export const callWith = (
  headers: Record<string, string>,
  method: string,
  path: string,
  body?: unknown,
): Promise<Reply> => call(undefined, method, path, body, headers);
