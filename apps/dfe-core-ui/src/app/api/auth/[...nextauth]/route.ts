import NextAuth from 'next-auth';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { endEngineSessions } from '@/core/auth/endEngineSessions';
import { authOptions, engineBaseUrl } from '@/core/config/auth';
import {
  engineTokenCookieFor,
  expiredEngineTokenCookies,
} from '@/core/config/engineTokenCookie';

type TRouteContext = { params: Promise<{ nextauth: string[] }> };

const handler = NextAuth(authOptions) as (
  req: NextRequest,
  context: TRouteContext,
) => Promise<Response>;

// NextAuth clears its session cookie only when the sign-out passed its CSRF check.
const SESSION_CLEARED = /^(__Secure-)?next-auth\.session-token(\.\d+)?=;/;

// The name=value pair of a session cookie NextAuth is setting, chunks included.
const SESSION_PAIR =
  /^((?:__Secure-)?next-auth\.session-token(?:\.\d+)?=[^;\s]+)/;

/**
 * A renewed session holds a new engine token, but the proxy only mirrors the
 * token into dfe_token on page loads, so an operator who stays in the embedded
 * HyperDX would keep the old one until it expired. The renewed session cookie
 * is read back from the response so the mirror is replanted with it.
 */
async function plantRenewedEngineToken(
  req: NextRequest,
  response: Response,
): Promise<void> {
  const pairs = response.headers
    .getSetCookie()
    .map((cookie) => SESSION_PAIR.exec(cookie)?.[1])
    .filter((pair): pair is string => pair !== undefined);
  if (pairs.length === 0) {
    return;
  }

  const renewed = await getToken({
    req: new NextRequest(req.url, { headers: { cookie: pairs.join('; ') } }),
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (renewed?.error !== undefined) {
    return;
  }
  const cookie = engineTokenCookieFor(
    renewed,
    req.nextUrl.protocol === 'https:',
  );
  if (!cookie) {
    return;
  }
  const carrier = new NextResponse();
  carrier.cookies.set(cookie);
  response.headers.append(
    'Set-Cookie',
    carrier.headers.get('set-cookie') ?? '',
  );
}

/**
 * A sign-out also ends the account's engine sessions and drops the engine token
 * mirrored for the HyperDX embed. The engine call happens before this response
 * reaches the browser, and a failed one does not stop the local sign-out.
 */
async function POST(
  req: NextRequest,
  context: TRouteContext,
): Promise<Response> {
  const { nextauth } = await context.params;
  const signingOut = nextauth[0] === 'signout';
  // Read now: the session cookie is on this request, not on the response.
  const session = signingOut
    ? await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    : null;

  const response = await handler(req, context);
  if (nextauth[0] === 'session' && response.ok) {
    await plantRenewedEngineToken(req, response);
  }
  if (!signingOut) {
    return response;
  }

  const signedOut = response.headers
    .getSetCookie()
    .some((cookie) => SESSION_CLEARED.test(cookie));
  const accessToken = session?.accessToken;
  if (signedOut && typeof accessToken === 'string' && accessToken !== '') {
    await endEngineSessions(accessToken, engineBaseUrl);
  }
  for (const cookie of expiredEngineTokenCookies(
    req.nextUrl.protocol === 'https:',
  )) {
    response.headers.append('Set-Cookie', cookie);
  }
  return response;
}

export { handler as GET, POST };
