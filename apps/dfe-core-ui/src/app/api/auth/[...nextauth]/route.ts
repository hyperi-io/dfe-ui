import NextAuth from 'next-auth';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { endEngineSessions } from '@/core/auth/endEngineSessions';
import { authOptions, engineBaseUrl } from '@/core/config/auth';
import { expiredEngineTokenCookies } from '@/core/config/engineTokenCookie';

type TRouteContext = { params: Promise<{ nextauth: string[] }> };

const handler = NextAuth(authOptions) as (
  req: NextRequest,
  context: TRouteContext,
) => Promise<Response>;

// NextAuth clears its session cookie only when the sign-out passed its CSRF check.
const SESSION_CLEARED = /^(__Secure-)?next-auth\.session-token(\.\d+)?=;/;

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
