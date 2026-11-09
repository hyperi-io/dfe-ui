import { Browser, Locator, Page, expect } from '@playwright/test';

import { BASE_URL } from '@e2e/config/e2e.client';
import { engineToken } from '@e2e/config/engineApi.helpers';
import { JOURNEY_USER, Reply, call, shot } from '@e2e/config/journey.helpers';
import { loginAs, textbox } from '@e2e/config/login.helpers';

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

export const callerFor =
  (token: string): Caller =>
  (method, path, body) =>
    call(token, method, path, body);

/** The engine as the journey account, through the token the other e2e helpers hold. */
export const adminApi = async (): Promise<Caller> =>
  callerFor(await engineToken());

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
  const user = textbox(page, 'Username');
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
