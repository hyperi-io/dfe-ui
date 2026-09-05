import { expect, test } from '@playwright/test';
import { transportOptions } from '../config/e2e.client';
import {
  HOST_RESOLVER_RULES,
  OIDC_BASE_URL,
  OIDC_EXPECTED_GROUP,
  OIDC_EXPECTED_ROLE,
  OIDC_ISSUER,
  OIDC_PASSWORD,
  OIDC_PROVIDER,
  OIDC_USER,
  interceptOidcCallback,
  oidcConfigured,
  oidcSkipReason,
  submitIdpLogin,
} from '../config/oidc.helpers';

/**
 * External OIDC against a real deployment, engine-as-relying-party (auth Path 2).
 *
 * The whole chain in one flow: the engine hands the browser to an external IdP,
 * the user authenticates there, the engine validates the returned id_token and
 * re-mints its OWN token, and the group claim resolves to the roles the
 * deployment grants that group. A test that only asserted "we got redirected"
 * would pass against an IdP that authenticates nobody, so every assertion here
 * is about the identity that came back.
 *
 * The deployment's IdP comes from `dfe-ops idp deploy` (dfe-infra). Skips
 * cleanly where no external IdP is configured, which is most runs.
 */

// File-level, not inside the describe: launchOptions forces its own worker and
// Playwright refuses it in a describe group.
test.use({
  // A private-CA edge and an IdP on the same wildcard: a deployment's own
  // certificate is not in any public trust store, so a run against one sets
  // E2E_IGNORE_HTTPS_ERRORS the same way the rest of the suite does.
  ...transportOptions(),
  // A deployment whose hostnames are not in the resolver this run can reach
  // (no split-horizon DNS, no wildcard record) still has to be drivable, and
  // the browser is the one client that cannot be told --resolve per request.
  launchOptions: HOST_RESOLVER_RULES
    ? { args: [`--host-resolver-rules=${HOST_RESOLVER_RULES}`] }
    : {},
});

test.describe('@acceptance @oidc external OIDC login', () => {
  test.skip(!oidcConfigured(), oidcSkipReason());

  // Two full page loads plus an IdP round trip.
  test.describe.configure({ timeout: 120_000 });

  test('the engine sends the user to the IdP and re-mints its own token', async ({
    page,
    playwright,
  }) => {
    // Before the flow starts: the callback's own JSON carries the re-minted
    // token, and the browser would otherwise render it into the retry trace.
    const readCallback = await interceptOidcCallback(page, OIDC_PROVIDER);

    await page.goto(`${OIDC_BASE_URL}/api/v1/auth/oidc/${OIDC_PROVIDER}/login`);

    // Asserting the ORIGIN, not the whole URL: the engine builds the authorize
    // URL from the IdP's discovery document, so the path is the IdP's to choose.
    expect(
      page.url().startsWith(OIDC_ISSUER),
      `the login endpoint sent us to ${page.url()} rather than to ${OIDC_ISSUER}`,
    ).toBeTruthy();

    await submitIdpLogin(page, { user: OIDC_USER, password: OIDC_PASSWORD });
    await page.waitForURL(
      (url) => url.pathname.endsWith(`/auth/oidc/${OIDC_PROVIDER}/callback`),
      { timeout: 60_000 },
    );

    const callback = readCallback();

    // The subject is the IdP's, not a local account name -- this is what proves
    // the identity crossed the boundary rather than being minted locally.
    expect(
      callback.subject,
      'the callback carried no IdP subject',
    ).toBeTruthy();
    expect(String(callback.email)).toContain('@');
    expect(
      callback.access_token,
      'the engine must re-mint its own token: downstream apps never see the IdP token',
    ).toBeTruthy();

    const groups = (callback.groups ?? []) as string[];
    expect(
      groups.length,
      'the id_token carried no groups claim -- the provider must request the ' +
        'groups scope AND the IdP must be configured to emit it, and neither ' +
        'failure reports itself',
    ).toBeGreaterThan(0);
    if (OIDC_EXPECTED_GROUP) expect(groups).toContain(OIDC_EXPECTED_GROUP);

    // The engine's own view of the session it just minted, which is what every
    // authorization decision downstream is actually made from. Asked from Node
    // with the token in a header: handing it to the page renders it.
    const api = await playwright.request.newContext({
      baseURL: OIDC_BASE_URL,
      ...transportOptions(),
    });
    const me = await api.get('/api/v1/auth/me', {
      headers: { Authorization: `Bearer ${callback.access_token as string}` },
    });
    const meBody = await me.text();
    await api.dispose();

    expect(
      me.status(),
      `the re-minted token did not authenticate: ${me.status()} ${meBody}`,
    ).toBe(200);
    const identity = JSON.parse(meBody);
    expect(identity.user_id).toBe(callback.subject);
    expect(identity.groups).toEqual(groups);

    // The point of the group claim: it has to resolve to real authority, or the
    // user is authenticated and can still do nothing.
    expect(
      identity.roles.length,
      `groups ${JSON.stringify(groups)} resolved to no roles -- the deployment ` +
        'has no group mapping for them',
    ).toBeGreaterThan(0);
    if (OIDC_EXPECTED_ROLE)
      expect(identity.roles).toContain(OIDC_EXPECTED_ROLE);
    expect(identity.permissions.length).toBeGreaterThan(0);
  });

  test('an unknown provider is refused rather than guessed at', async ({
    page,
  }) => {
    const response = await page.goto(
      `${OIDC_BASE_URL}/api/v1/auth/oidc/definitely-not-registered/login`,
    );
    expect(response?.status()).toBe(404);
  });
});
