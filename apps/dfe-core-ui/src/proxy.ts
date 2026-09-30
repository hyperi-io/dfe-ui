import { CHANGE_PASSWORD_PATH } from '@/core/config/authSession';
import {
  CSP_REQUEST_HEADER,
  contentSecurityPolicy,
  createNonce,
  cspSources,
} from '@/core/config/contentSecurityPolicy';
import {
  LOGIN_CALLBACK_PATH_HEADER,
  pathWithSearch,
} from '@/core/config/loginCallback';
import {
  getSetupStatus,
  MissingApiUrlError,
} from '@/core/server/actions/getSetupStatus';
import { getToken } from 'next-auth/jwt';
import { withAuth } from 'next-auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/*
 * Next.js 16 middleware (renamed middleware -> proxy; nodejs runtime).
 *
 * withAuth guards the (auth) route group. Authentication is checked FIRST and
 * the setup redirect only applies to a request that already carries a session:
 * the wizard's every call is an authenticated engine call, so handing an
 * anonymous visitor the wizard produces a form that 401s on submit. Anonymous →
 * /login, authenticated + incomplete → /setup.
 *
 * Proxy-trust addition (DFE_AUTH_MODE=proxy, single origin behind Envoy): when
 * the engine has forwarded its ES384 token (dfe_token cookie) but NextAuth has
 * no session yet, bounce to /login where the proxy-trust auto-trigger runs the
 * CSRF-safe NextAuth callback (which re-verifies the token against the engine
 * JWKS) and then returns the browser to where it was headed. No password form.
 *
 * Embedded-HyperDX addition: HyperDX runs on its own subdomain and is embedded
 * as an iframe. The fork verifies the engine's ES384 token from a `dfe_token`
 * cookie, so we mirror the session's access token into that cookie scoped to the
 * shared parent domain (DFE_COOKIE_DOMAIN). The iframe subdomain is same-site
 * with the UI, so the cookie rides the iframe request and the fork authenticates
 * the user - no second login. This is auth-method agnostic: it works the same
 * whether the session came from local login or an external OIDC provider.
 *
 * Every page, the self-guarded ones included, leaves here carrying a fresh
 * Content-Security-Policy nonce (src/core/config/contentSecurityPolicy.ts).
 */

// Cookie the single-origin proxy sets carrying the engine ES384 JWT. Kept
// inline so this middleware bundle does not pull in jose - the verification
// path lives in src/core/config/proxyTrust.ts.
const DFE_TOKEN_COOKIE = 'dfe_token';

// NextAuth session cookie names (dev + __Secure variant behind TLS).
const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function isProxyAuthMode(): boolean {
  const mode =
    process.env.DFE_AUTH_MODE ?? process.env.NEXT_PUBLIC_DFE_AUTH_MODE;
  return mode === 'proxy';
}

// Parent domain the dfe_token cookie is scoped to so it reaches the HyperDX
// iframe subdomain. A deployment parameter: empty leaves the cookie host-only
// (single-origin / docker), which is correct when HyperDX shares the UI host.
function cookieDomain(): string | undefined {
  const domain = process.env.DFE_COOKIE_DOMAIN;
  return domain && domain.trim() !== '' ? domain.trim() : undefined;
}

// Mirror the session's engine access token into the dfe_token cookie so the
// embedded HyperDX iframe authenticates as the same user. No-op when the request
// carries no session token (e.g. the /login bounce), or when the account must
// still change its issued password and so may use nothing yet.
async function plantEngineTokenCookie(
  req: NextRequest,
  res: NextResponse,
): Promise<void> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const accessToken = token?.accessToken;
  if (typeof accessToken !== 'string' || accessToken === '') {
    return;
  }
  if (token?.passwordChangeRequired === true) {
    return;
  }

  const expiresAt =
    typeof token?.accessTokenExpiresAt === 'number'
      ? token.accessTokenExpiresAt
      : undefined;
  const maxAge =
    expiresAt !== undefined
      ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      : undefined;

  res.cookies.set(DFE_TOKEN_COOKIE, accessToken, {
    domain: cookieDomain(),
    path: '/',
    httpOnly: true,
    secure: req.nextUrl.protocol === 'https:',
    sameSite: 'lax',
    maxAge,
  });
}

const authMiddleware = withAuth({
  pages: { signIn: '/login' },
});

// A missing engine URL is a broken container, not a setup that is complete, so
// it fails the request rather than routing to /login; an unreachable engine
// still falls through.
async function isInitialSetupIncomplete(): Promise<boolean> {
  try {
    const { initial_setup } = await getSetupStatus();
    return !initial_setup.complete;
  } catch (error) {
    if (error instanceof MissingApiUrlError) {
      throw error;
    }
    return false;
  }
}

async function isPasswordChangeRequired(req: NextRequest): Promise<boolean> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return token?.passwordChangeRequired === true;
}

// Pages that guard themselves in their own layout, so the proxy only adds the policy.
function isSelfGuardedPage(pathname: string): boolean {
  return ['/login', '/setup', '/change-password'].some((prefix) =>
    pathname.startsWith(prefix),
  );
}

// Next stamps the nonce onto its scripts only when the forwarded request carries the policy too.
function nextWithPolicy(
  req: NextRequest,
  extraRequestHeaders: Record<string, string> = {},
): NextResponse {
  const policy = contentSecurityPolicy({
    nonce: createNonce(),
    dev: process.env.NODE_ENV === 'development',
    sources: cspSources({
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      hyperdxUrl: process.env.HYPERDX_URL,
      hyperdxPort: process.env.HYPERDX_PORT,
      requestHost:
        req.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
        req.headers.get('host') ||
        req.nextUrl.host,
    }),
  });
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set(CSP_REQUEST_HEADER, policy);
  for (const [name, value] of Object.entries(extraRequestHeaders)) {
    requestHeaders.set(name, value);
  }
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', policy);
  return response;
}

function nextWithCallbackPath(req: NextRequest): NextResponse {
  return nextWithPolicy(req, {
    [LOGIN_CALLBACK_PATH_HEADER]: pathWithSearch(
      req.nextUrl.pathname,
      req.nextUrl.search,
    ),
  });
}

export default async function proxy(
  req: NextRequest,
  event: Parameters<typeof authMiddleware>[1],
) {
  if (isSelfGuardedPage(req.nextUrl.pathname)) {
    return nextWithPolicy(req);
  }

  if (isProxyAuthMode()) {
    const hasSession = SESSION_COOKIES.some((name) => req.cookies.has(name));
    const hasEngineToken = req.cookies.has(DFE_TOKEN_COOKIE);
    if (hasEngineToken && !hasSession) {
      const callbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}`;
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `callbackUrl=${encodeURIComponent(callbackUrl)}`;
      return NextResponse.redirect(url);
    }
  }

  const result = await authMiddleware(
    req as Parameters<typeof authMiddleware>[0],
    event,
  );
  const isRedirect =
    result instanceof NextResponse && result.headers.has('location');
  if (isRedirect) {
    await plantEngineTokenCookie(req, result);
    return result;
  }

  // Before the wizard and every page: the engine refuses an account on an issued
  // password everything but the change, so the change comes first.
  if (await isPasswordChangeRequired(req)) {
    const url = req.nextUrl.clone();
    url.pathname = CHANGE_PASSWORD_PATH;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // Authenticated from here, so the setup status is worth the engine round trip.
  if (await isInitialSetupIncomplete()) {
    const url = req.nextUrl.clone();
    url.pathname = '/setup';
    url.search = '';
    const response = NextResponse.redirect(url);
    await plantEngineTokenCookie(req, response);
    return response;
  }

  const response = nextWithCallbackPath(req);
  await plantEngineTokenCookie(req, response);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match every page except static files and the NextAuth API routes.
     * (auth) group renders at / so we protect the root and its children.
     * /login, /setup and /change-password are matched for the security policy
     * only (isSelfGuardedPage), so auth redirects cannot loop. Each guards
     * itself in its own layout.
     *
     * The health trinity and /metrics are excluded too, and that is load-bearing
     * rather than cosmetic. kubelet probes and Prometheus scrapes carry no session,
     * so withAuth answered them with a 307 to /login -- and k8s counts ANY 2xx/3xx as
     * success, so the probe would have passed while the app was face down: a health
     * check reporting on the login redirect, not on the app. Worse than no probe.
     * Prometheus would have scraped login HTML and recorded nothing.
     *
     * They expose a status string and process/runtime counters -- no user data, no
     * app state. Probes and scrapes are unauthenticated by definition; if this
     * namespace is ever open enough for that to matter, the fix is a NetworkPolicy,
     * not an auth redirect on a health check.
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|livez|readyz|metrics).*)',
  ],
};
