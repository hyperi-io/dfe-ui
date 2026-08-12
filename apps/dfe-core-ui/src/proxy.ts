import { withAuth } from 'next-auth/middleware';
import { NextResponse, type NextRequest } from 'next/server';

/*
 * Next.js 16 middleware (renamed middleware -> proxy; nodejs runtime).
 *
 * Default behaviour is unchanged: withAuth guards the (auth) route group and
 * redirects unauthenticated users to /setup (first-run / engine readiness).
 *
 * Proxy-trust addition (DFE_AUTH_MODE=proxy, single origin behind Envoy): when
 * the engine has forwarded its ES384 token (dfe_token cookie) but NextAuth has
 * no session yet, bounce to /login where the proxy-trust auto-trigger runs the
 * CSRF-safe NextAuth callback (which re-verifies the token against the engine
 * JWKS) and then returns the browser to where it was headed. No password form.
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

const authMiddleware = withAuth({
  pages: { signIn: '/login' },
});

export default function proxy(
  req: NextRequest,
  event: Parameters<typeof authMiddleware>[1],
) {
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

  return authMiddleware(req as Parameters<typeof authMiddleware>[0], event);
}

export const config = {
  matcher: [
    /*
     * Match all paths under (auth) except static files and api routes.
     * (auth) group renders at / so we protect the root and its children.
     * /login and /setup are excluded so auth redirects cannot loop.
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
    '/((?!login|setup|api/auth|_next/static|_next/image|favicon.ico|livez|readyz|metrics).*)',
  ],
};
