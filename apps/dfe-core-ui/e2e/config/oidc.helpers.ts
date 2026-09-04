import { Page, expect } from '@playwright/test';

/**
 * Helpers for the external-OIDC acceptance spec.
 *
 * The deployment under test is fronted by a tester IdP stood up with
 * `dfe-ops idp deploy` (dfe-infra) -- Dex over a glauth LDAP directory. It is
 * registered with the engine as a `generic` provider on purpose, so nothing
 * here may lean on a Dex-ism: the login form is the only Dex-shaped thing, and
 * it is isolated in submitIdpLogin below.
 *
 * Everything is env-driven and absent env skips the spec, because most runs of
 * this suite are against a deployment with no external IdP at all.
 */

/** Engine origin, as a browser reaches it. Empty disables the whole spec. */
export const OIDC_BASE_URL = process.env.E2E_OIDC_BASE_URL || '';

/** The provider name the engine registered the IdP under. */
export const OIDC_PROVIDER = process.env.E2E_OIDC_PROVIDER || 'dex';

/** The IdP's issuer, so the spec can assert WHERE it was sent. */
export const OIDC_ISSUER = process.env.E2E_OIDC_DEX_ISSUER || '';

/** A directory user, and the group the deployment maps to a role. */
export const OIDC_USER = process.env.E2E_OIDC_DEX_USER || '';
export const OIDC_PASSWORD = process.env.E2E_OIDC_DEX_PASSWORD || '';
export const OIDC_EXPECTED_GROUP = process.env.E2E_OIDC_EXPECTED_GROUP || '';
export const OIDC_EXPECTED_ROLE = process.env.E2E_OIDC_EXPECTED_ROLE || '';

/**
 * Chromium --host-resolver-rules, for a deployment whose hostnames this run
 * cannot resolve (e.g. "MAP *.dfe.example.com 192.0.2.10"). Empty leaves the
 * browser on the system resolver.
 */
export const HOST_RESOLVER_RULES = process.env.E2E_HOST_RESOLVER_RULES || '';

/** Everything the spec needs before it can run at all. */
export const oidcConfigured = (): boolean =>
  Boolean(OIDC_BASE_URL && OIDC_ISSUER && OIDC_USER && OIDC_PASSWORD);

/** Why it was skipped, so a misconfigured run says so instead of passing. */
export const oidcSkipReason = () =>
  'external OIDC is not configured for this deployment -- set E2E_OIDC_BASE_URL, ' +
  'E2E_OIDC_DEX_ISSUER, E2E_OIDC_DEX_USER and E2E_OIDC_DEX_PASSWORD to run it';

/**
 * Fill and submit the IdP's own login form.
 *
 * The ONLY provider-shaped step in the spec. A different IdP replaces this
 * function and nothing else moves.
 */
export const submitIdpLogin = async (
  page: Page,
  { user, password }: { user: string; password: string },
): Promise<void> => {
  await page.locator('input[name="login"]').fill(user);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
};

/**
 * The engine's callback answers with JSON, which the browser renders as text.
 *
 * Read as text rather than through an API request context on purpose: the
 * state and nonce live in a cookie the BROWSER holds, so only the browser can
 * complete the flow the way a real user does.
 */
export const readJsonBody = async (page: Page): Promise<Record<string, unknown>> => {
  const text = await page.evaluate(() => document.body.innerText);
  try {
    return JSON.parse(text);
  } catch {
    expect(
      false,
      `the OIDC callback did not answer with JSON: ${text.slice(0, 400)}`,
    ).toBeTruthy();
    return {};
  }
};
