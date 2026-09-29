import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authOptions } from '@/core/config/auth';
import { expiredEngineTokenCookies } from '@/core/config/engineTokenCookie';

type TRouteContext = { params: Promise<{ nextauth: string[] }> };

const handler = NextAuth(authOptions) as (
  req: NextRequest,
  context: TRouteContext,
) => Promise<Response>;

// A sign-out also drops the engine token mirrored for the HyperDX embed, or the embed stays signed in.
async function POST(
  req: NextRequest,
  context: TRouteContext,
): Promise<Response> {
  const response = await handler(req, context);
  const { nextauth } = await context.params;
  if (nextauth[0] === 'signout') {
    for (const cookie of expiredEngineTokenCookies(
      req.nextUrl.protocol === 'https:',
    )) {
      response.headers.append('Set-Cookie', cookie);
    }
  }
  return response;
}

export { handler as GET, POST };
