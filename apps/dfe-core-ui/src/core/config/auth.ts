import { oidcTokenProvider } from '@/core/auth/oidcTokenProvider';
import { renewEngineSession } from '@/core/auth/renewEngineSession';
import { safeRedirectPath } from '@/core/config/loginCallback';
import { authMePath } from '@/core/hooks/useAuthMe/api';
import { loginPath } from '@/core/hooks/useLogin/api';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/** The engine as the server reaches it; every server-side engine call starts here. */
export const engineBaseUrl =
  process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';
const baseUrl = engineBaseUrl;

/** The browser's X-Forwarded-For chain, so the engine's login audit can name the client rather than this pod. */
export function forwardedForHeader(
  headers: Record<string, unknown> | undefined,
): Record<string, string> {
  const value = headers?.['x-forwarded-for'];
  const chain = Array.isArray(value) ? value.join(', ') : value;
  return typeof chain === 'string' && chain.trim() !== ''
    ? { 'X-Forwarded-For': chain.trim() }
    : {};
}

/** Local-account flow: POST /auth/login then GET /me for roles. */
const credentialsProvider = CredentialsProvider({
  name: 'Credentials',
  credentials: {
    username: { label: 'Username', type: 'text' },
    password: { label: 'Password', type: 'password' },
  },
  async authorize(credentials, req) {
    if (!credentials?.username || !credentials?.password) return null;
    const loginRes = await fetch(`${baseUrl}${loginPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...forwardedForHeader(req?.headers),
      },
      body: JSON.stringify({
        username: credentials.username,
        password: credentials.password,
      }),
    });
    if (!loginRes.ok) return null;
    const tokenData = (await loginRes.json()) as {
      access_token: string;
      expires_in?: number;
      password_change_required?: boolean;
    };

    const meRes = await fetch(`${baseUrl}${authMePath}`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const roles: string[] =
      meRes.ok &&
      meRes.headers.get('content-type')?.includes('application/json')
        ? (((await meRes.json()) as { roles?: string[] }).roles ?? [])
        : [];

    return {
      id: credentials.username,
      name: credentials.username,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in ?? 86400,
      roles,
      passwordChangeRequired: tokenData.password_change_required === true,
    };
  },
});

// The OIDC hand-back provider: an external IdP login lands on /login/oidc with an engine token.
export const authOptions: NextAuthOptions = {
  providers: [credentialsProvider, oidcTokenProvider(baseUrl)],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const expiresIn = (user as { expiresIn?: number }).expiresIn ?? 86400;
        token.accessToken = (user as { accessToken?: string }).accessToken;
        token.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
        token.roles = (user as { roles?: string[] }).roles ?? [];
        token.passwordChangeRequired = user.passwordChangeRequired === true;
        delete token.error;
        return token;
      }

      // An update carries no trusted data: the engine renews what the session already holds.
      if (trigger === 'update') {
        return renewEngineSession(token, baseUrl);
      }

      if (
        typeof token.accessTokenExpiresAt === 'number' &&
        Date.now() >= token.accessTokenExpiresAt
      ) {
        return {
          ...token,
          error: 'AccessTokenExpired',
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { accessToken?: string }).accessToken =
          token.accessToken as string | undefined;
        (session.user as { roles?: string[] }).roles =
          (token.roles as string[]) ?? [];
      }
      if (token.error === 'AccessTokenExpired') {
        session.error = 'AccessTokenExpired';
      } else {
        delete session.error;
      }
      session.accessTokenExpiresAt = token.accessTokenExpiresAt;
      session.passwordChangeRequired = token.passwordChangeRequired === true;
      return session;
    },
    async redirect({ url, baseUrl: origin }) {
      return `${origin}${safeRedirectPath(url, origin)}`;
    },
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};
